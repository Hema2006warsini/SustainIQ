import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { invalidateOrgCache } from '../config/redis';
import { calculateRecordScores } from '../services/scoringService';
import '../middleware/auth';
import { ESGRecord } from '../types';

export function formatRecord(row: any): ESGRecord {
  const dateStr = row.record_date instanceof Date
    ? row.record_date.toISOString().split('T')[0]
    : String(row.record_date).split('T')[0];

  let customMetrics = {};
  if (typeof row.custom_metrics === 'string') {
    try {
      customMetrics = JSON.parse(row.custom_metrics);
    } catch {
      customMetrics = {};
    }
  } else if (row.custom_metrics) {
    customMetrics = row.custom_metrics;
  }

  const createdAt = row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at || new Date().toISOString());
  const updatedAt = row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at || new Date().toISOString());

  return {
    id: String(row.id),
    organization_id: String(row.organization_id),
    record_date: dateStr,
    energy_consumption: Number(row.energy_consumption || 0),
    water_consumption: Number(row.water_consumption || 0),
    waste_generated: Number(row.waste_generated || 0),
    waste_recycled: Number(row.waste_recycled || 0),
    carbon_emissions: Number(row.carbon_emissions || 0),
    renewable_energy_percentage: Number(row.renewable_energy_percentage || 0),
    employees: Number(row.employees || 1),
    training_hours: Number(row.training_hours || 0),
    safety_incidents: Number(row.safety_incidents || 0),
    community_initiatives: Number(row.community_initiatives || 0),
    compliance_percentage: Number(row.compliance_percentage || 0),
    ethics_incidents: Number(row.ethics_incidents || 0),
    governance_score: Number(row.governance_score || 0),
    environmental_score: row.environmental_score !== null && row.environmental_score !== undefined ? Number(row.environmental_score) : undefined,
    social_score: row.social_score !== null && row.social_score !== undefined ? Number(row.social_score) : undefined,
    governance_score_calculated: row.governance_score_calculated !== null && row.governance_score_calculated !== undefined ? Number(row.governance_score_calculated) : undefined,
    overall_esg_score: row.overall_esg_score !== null && row.overall_esg_score !== undefined ? Number(row.overall_esg_score) : undefined,
    custom_metrics: customMetrics,
    created_at: createdAt,
    updated_at: updatedAt,
  };
}

export async function getRecordsByOrg(req: Request, res: Response, next: NextFunction) {
  try {
    const { orgId } = req.params;
    const userId = req.user!.id;

    // Verify organization belongs to authenticated user
    const orgCheck = await query(
      'SELECT id FROM organizations WHERE id = $1 AND owner_id = $2',
      [orgId, userId]
    );

    if (orgCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    const records = await query(
      'SELECT * FROM esg_records WHERE organization_id = $1 ORDER BY record_date DESC',
      [orgId]
    );

    res.json(records.rows.map(formatRecord));
  } catch (err) {
    next(err);
  }
}

export async function getRecordById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const result = await query(
      `SELECT r.* FROM esg_records r
       JOIN organizations o ON r.organization_id = o.id
       WHERE r.id = $1 AND o.owner_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'ESG record not found' });
    }

    res.json(formatRecord(result.rows[0]));
  } catch (err) {
    next(err);
  }
}

export async function createRecord(req: Request, res: Response, next: NextFunction) {
  try {
    const { orgId } = req.params;
    const userId = req.user!.id;
    const data: Partial<ESGRecord> = req.body;

    // Verify organization exists and belongs to the authenticated user
    const orgCheck = await query(
      'SELECT id FROM organizations WHERE id = $1 AND owner_id = $2',
      [orgId, userId]
    );

    if (orgCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Transparent mathematical scoring calculation
    const scores = calculateRecordScores(data);

    const recordDate = data.record_date || (data as any).recordDate;
    const energy = Number(data.energy_consumption ?? (data as any).energyConsumption ?? 0);
    const water = Number(data.water_consumption ?? (data as any).waterConsumption ?? 0);
    const wasteGen = Number(data.waste_generated ?? (data as any).wasteGenerated ?? 0);
    const wasteRec = Number(data.waste_recycled ?? (data as any).wasteRecycled ?? 0);
    const carbon = Number(data.carbon_emissions ?? (data as any).carbonEmissions ?? 0);
    const renewable = Number(data.renewable_energy_percentage ?? (data as any).renewableEnergyPercentage ?? 0);
    const employees = Number(data.employees ?? 1);
    const training = Number(data.training_hours ?? (data as any).trainingHours ?? 0);
    const safety = Number(data.safety_incidents ?? (data as any).safetyIncidents ?? 0);
    const community = Number(data.community_initiatives ?? (data as any).communityInitiatives ?? 0);
    const compliance = Number(data.compliance_percentage ?? (data as any).compliancePercentage ?? 0);
    const ethics = Number(data.ethics_incidents ?? (data as any).ethicsIncidents ?? 0);
    const gov = Number(data.governance_score ?? (data as any).governanceScore ?? 0);
    const custom = data.custom_metrics || (data as any).customMetrics || {};

    const insertRes = await query(
      `INSERT INTO esg_records (
        organization_id, record_date, energy_consumption, water_consumption,
        waste_generated, waste_recycled, carbon_emissions, renewable_energy_percentage,
        employees, training_hours, safety_incidents, community_initiatives,
        compliance_percentage, ethics_incidents, governance_score,
        environmental_score, social_score, governance_score_calculated, overall_esg_score,
        custom_metrics
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
      ) RETURNING *`,
      [
        orgId,
        recordDate,
        energy,
        water,
        wasteGen,
        wasteRec,
        carbon,
        renewable,
        employees,
        training,
        safety,
        community,
        compliance,
        ethics,
        gov,
        scores.environmental_score,
        scores.social_score,
        scores.governance_score_calculated,
        scores.overall_esg_score,
        JSON.stringify(custom),
      ]
    );

    // Invalidate Redis dashboard cache for this user & org
    await invalidateOrgCache(orgId, userId);

    res.status(201).json(formatRecord(insertRes.rows[0]));
  } catch (err) {
    next(err);
  }
}

export async function updateRecord(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const data: Partial<ESGRecord> = req.body;

    // Verify organization ownership
    const checkRes = await query(
      `SELECT r.* FROM esg_records r
       JOIN organizations o ON r.organization_id = o.id
       WHERE r.id = $1 AND o.owner_id = $2`,
      [id, userId]
    );

    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: 'ESG record not found' });
    }

    const current = checkRes.rows[0];

    // Recalculate transparent scores
    const mergedData = {
      ...current,
      ...data,
    };
    const scores = calculateRecordScores(mergedData);

    const recordDate = data.record_date || (data as any).recordDate || current.record_date;
    const energy = Number(data.energy_consumption ?? (data as any).energyConsumption ?? current.energy_consumption);
    const water = Number(data.water_consumption ?? (data as any).waterConsumption ?? current.water_consumption);
    const wasteGen = Number(data.waste_generated ?? (data as any).wasteGenerated ?? current.waste_generated);
    const wasteRec = Number(data.waste_recycled ?? (data as any).wasteRecycled ?? current.waste_recycled);
    const carbon = Number(data.carbon_emissions ?? (data as any).carbonEmissions ?? current.carbon_emissions);
    const renewable = Number(data.renewable_energy_percentage ?? (data as any).renewableEnergyPercentage ?? current.renewable_energy_percentage);
    const employees = Number(data.employees ?? current.employees);
    const training = Number(data.training_hours ?? (data as any).trainingHours ?? current.training_hours);
    const safety = Number(data.safety_incidents ?? (data as any).safetyIncidents ?? current.safety_incidents);
    const community = Number(data.community_initiatives ?? (data as any).communityInitiatives ?? current.community_initiatives);
    const compliance = Number(data.compliance_percentage ?? (data as any).compliancePercentage ?? current.compliance_percentage);
    const ethics = Number(data.ethics_incidents ?? (data as any).ethicsIncidents ?? current.ethics_incidents);
    const gov = Number(data.governance_score ?? (data as any).governanceScore ?? current.governance_score);
    const custom = (data.custom_metrics !== undefined || (data as any).customMetrics !== undefined)
      ? (data.custom_metrics || (data as any).customMetrics || {})
      : (typeof current.custom_metrics === 'string' ? JSON.parse(current.custom_metrics) : current.custom_metrics);

    const updateRes = await query(
      `UPDATE esg_records SET
        record_date = $1, energy_consumption = $2, water_consumption = $3,
        waste_generated = $4, waste_recycled = $5, carbon_emissions = $6,
        renewable_energy_percentage = $7, employees = $8, training_hours = $9,
        safety_incidents = $10, community_initiatives = $11, compliance_percentage = $12,
        ethics_incidents = $13, governance_score = $14, environmental_score = $15,
        social_score = $16, governance_score_calculated = $17, overall_esg_score = $18,
        custom_metrics = $19, updated_at = CURRENT_TIMESTAMP
      WHERE id = $20
      RETURNING *`,
      [
        recordDate,
        energy,
        water,
        wasteGen,
        wasteRec,
        carbon,
        renewable,
        employees,
        training,
        safety,
        community,
        compliance,
        ethics,
        gov,
        scores.environmental_score,
        scores.social_score,
        scores.governance_score_calculated,
        scores.overall_esg_score,
        JSON.stringify(custom),
        id,
      ]
    );

    const orgId = String(current.organization_id);
    await invalidateOrgCache(orgId, userId);

    res.json(formatRecord(updateRes.rows[0]));
  } catch (err) {
    next(err);
  }
}

export async function deleteRecord(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const checkRes = await query(
      `SELECT r.id, r.organization_id FROM esg_records r
       JOIN organizations o ON r.organization_id = o.id
       WHERE r.id = $1 AND o.owner_id = $2`,
      [id, userId]
    );

    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: 'ESG record not found' });
    }

    const orgId = String(checkRes.rows[0].organization_id);

    await query('DELETE FROM esg_records WHERE id = $1', [id]);

    await invalidateOrgCache(orgId, userId);

    res.json({ message: 'ESG record deleted successfully' });
  } catch (err) {
    next(err);
  }
}
