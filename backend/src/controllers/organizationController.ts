import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { invalidateOrgCache } from '../config/redis';
import '../middleware/auth';

export function formatOrg(row: any) {
  let schema = {};
  if (typeof row.custom_metrics_schema === 'string') {
    try {
      schema = JSON.parse(row.custom_metrics_schema);
    } catch {
      schema = {};
    }
  } else if (row.custom_metrics_schema) {
    schema = row.custom_metrics_schema;
  }

  const createdAt = row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at || new Date().toISOString());
  const updatedAt = row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at || new Date().toISOString());

  return {
    id: row.id,
    name: row.name,
    type: row.type,
    location: row.location,
    reporting_year: Number(row.reporting_year),
    reportingYear: Number(row.reporting_year),
    custom_metrics_schema: schema,
    customMetricsSchema: schema,
    owner_id: row.owner_id ? String(row.owner_id) : undefined,
    ownerId: row.owner_id ? String(row.owner_id) : undefined,
    created_at: createdAt,
    updated_at: updatedAt,
    createdAt,
    updatedAt,
  };
}

export async function getOrganizations(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const result = await query(
      'SELECT * FROM organizations WHERE owner_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows.map(formatOrg));
  } catch (err) {
    next(err);
  }
}

export async function getOrganizationById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const result = await query(
      'SELECT * FROM organizations WHERE id = $1 AND owner_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.json(formatOrg(result.rows[0]));
  } catch (err) {
    next(err);
  }
}

export async function createOrganization(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const {
      name,
      type,
      location,
      reporting_year,
      reportingYear,
      custom_metrics_schema,
      customMetricsSchema,
    } = req.body;

    const year = Number(reporting_year !== undefined ? reporting_year : reportingYear);
    const schema = custom_metrics_schema || customMetricsSchema || {};

    const result = await query(
      `INSERT INTO organizations (name, type, location, reporting_year, custom_metrics_schema, owner_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name.trim(), type.trim(), location.trim(), year, JSON.stringify(schema), userId]
    );

    res.status(201).json(formatOrg(result.rows[0]));
  } catch (err) {
    next(err);
  }
}

export async function updateOrganization(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Verify ownership
    const check = await query(
      'SELECT * FROM organizations WHERE id = $1 AND owner_id = $2',
      [id, userId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    const current = check.rows[0];
    const {
      name,
      type,
      location,
      reporting_year,
      reportingYear,
      custom_metrics_schema,
      customMetricsSchema,
    } = req.body;

    const newName = name !== undefined ? name.trim() : current.name;
    const newType = type !== undefined ? type.trim() : current.type;
    const newLocation = location !== undefined ? location.trim() : current.location;
    const newYear = (reporting_year !== undefined || reportingYear !== undefined)
      ? Number(reporting_year !== undefined ? reporting_year : reportingYear)
      : Number(current.reporting_year);
    const newSchema = (custom_metrics_schema !== undefined || customMetricsSchema !== undefined)
      ? (custom_metrics_schema || customMetricsSchema || {})
      : (typeof current.custom_metrics_schema === 'string' ? JSON.parse(current.custom_metrics_schema) : current.custom_metrics_schema);

    const updateRes = await query(
      `UPDATE organizations
       SET name = $1, type = $2, location = $3, reporting_year = $4, custom_metrics_schema = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND owner_id = $7
       RETURNING *`,
      [newName, newType, newLocation, newYear, JSON.stringify(newSchema), id, userId]
    );

    await invalidateOrgCache(id, userId);

    res.json(formatOrg(updateRes.rows[0]));
  } catch (err) {
    next(err);
  }
}

export async function deleteOrganization(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const result = await query(
      'DELETE FROM organizations WHERE id = $1 AND owner_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    await invalidateOrgCache(id, userId);

    res.json({ message: 'Organization and associated ESG records deleted successfully' });
  } catch (err) {
    next(err);
  }
}
