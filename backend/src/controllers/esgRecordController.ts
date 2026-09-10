import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { invalidateOrgCache } from '../config/redis';
import { calculateRecordScores } from '../services/scoringService';
import { ESGRecord } from '../types';

export async function getRecordsByOrg(req: Request, res: Response, next: NextFunction) {
  try {
    const { orgId } = req.params;
    const result = await query(
      'SELECT * FROM esg_records WHERE organization_id = $1 ORDER BY record_date DESC',
      [orgId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

export async function getRecordById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM esg_records WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'ESG record not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function createRecord(req: Request, res: Response, next: NextFunction) {
  try {
    const { orgId } = req.params;
    const data: Partial<ESGRecord> = req.body;

    // Check organization exists
    const orgCheck = await query('SELECT id FROM organizations WHERE id = $1', [orgId]);
    if (orgCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Transparent mathematical scoring calculation
    const scores = calculateRecordScores(data);

    const result = await query(
      `INSERT INTO esg_records (
        organization_id, record_date,
        energy_consumption, water_consumption, waste_generated, waste_recycled,
        carbon_emissions, renewable_energy_percentage,
        employees, training_hours, safety_incidents, community_initiatives,
        compliance_percentage, ethics_incidents, governance_score,
        environmental_score, social_score, governance_score_calculated, overall_esg_score,
        custom_metrics
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
      ) RETURNING *`,
      [
        orgId,
        data.record_date,
        data.energy_consumption,
        data.water_consumption,
        data.waste_generated,
        data.waste_recycled,
        data.carbon_emissions,
        data.renewable_energy_percentage,
        data.employees,
        data.training_hours,
        data.safety_incidents,
        data.community_initiatives,
        data.compliance_percentage,
        data.ethics_incidents,
        data.governance_score,
        scores.environmental_score,
        scores.social_score,
        scores.governance_score_calculated,
        scores.overall_esg_score,
        JSON.stringify(data.custom_metrics || {}),
      ]
    );

    // Invalidate Redis dashboard cache for this organization
    await invalidateOrgCache(orgId);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function updateRecord(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data: Partial<ESGRecord> = req.body;

    // Fetch existing record to verify and get organization_id
    const existingResult = await query('SELECT organization_id FROM esg_records WHERE id = $1', [id]);
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'ESG record not found' });
    }
    const orgId = existingResult.rows[0].organization_id;

    // Recalculate transparent scores
    const scores = calculateRecordScores(data);

    const result = await query(
      `UPDATE esg_records SET
        record_date = $1,
        energy_consumption = $2,
        water_consumption = $3,
        waste_generated = $4,
        waste_recycled = $5,
        carbon_emissions = $6,
        renewable_energy_percentage = $7,
        employees = $8,
        training_hours = $9,
        safety_incidents = $10,
        community_initiatives = $11,
        compliance_percentage = $12,
        ethics_incidents = $13,
        governance_score = $14,
        environmental_score = $15,
        social_score = $16,
        governance_score_calculated = $17,
        overall_esg_score = $18,
        custom_metrics = $19,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $20
      RETURNING *`,
      [
        data.record_date,
        data.energy_consumption,
        data.water_consumption,
        data.waste_generated,
        data.waste_recycled,
        data.carbon_emissions,
        data.renewable_energy_percentage,
        data.employees,
        data.training_hours,
        data.safety_incidents,
        data.community_initiatives,
        data.compliance_percentage,
        data.ethics_incidents,
        data.governance_score,
        scores.environmental_score,
        scores.social_score,
        scores.governance_score_calculated,
        scores.overall_esg_score,
        JSON.stringify(data.custom_metrics || {}),
        id,
      ]
    );

    // Invalidate Redis dashboard cache
    await invalidateOrgCache(orgId);

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function deleteRecord(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    // Fetch existing record to know organization_id
    const existingResult = await query('SELECT organization_id FROM esg_records WHERE id = $1', [id]);
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'ESG record not found' });
    }
    const orgId = existingResult.rows[0].organization_id;

    await query('DELETE FROM esg_records WHERE id = $1', [id]);

    // Invalidate Redis dashboard cache
    await invalidateOrgCache(orgId);

    res.json({ message: 'ESG record deleted successfully' });
  } catch (err) {
    next(err);
  }
}
