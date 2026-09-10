import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { invalidateOrgCache } from '../config/redis';

export async function getOrganizations(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await query('SELECT * FROM organizations ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

export async function getOrganizationById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM organizations WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function createOrganization(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, type, location, reporting_year, custom_metrics_schema } = req.body;
    const result = await query(
      `INSERT INTO organizations (name, type, location, reporting_year, custom_metrics_schema)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, type, location, reporting_year, JSON.stringify(custom_metrics_schema || {})]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function updateOrganization(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { name, type, location, reporting_year } = req.body;
    const result = await query(
      `UPDATE organizations
       SET name = $1, type = $2, location = $3, reporting_year = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [name, type, location, reporting_year, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    await invalidateOrgCache(id);
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function deleteOrganization(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM organizations WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    await invalidateOrgCache(id);
    res.json({ message: 'Organization and associated ESG records deleted successfully' });
  } catch (err) {
    next(err);
  }
}
