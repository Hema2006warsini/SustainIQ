import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const organizationSchema = z.object({
  name: z.string().trim().min(1, 'Organization name is required'),
  type: z.string().trim().min(1, 'Organization type is required'),
  location: z.string().trim().min(1, 'Location is required'),
  reporting_year: z.coerce
    .number({ invalid_type_error: 'Reporting year must be a valid number' })
    .int()
    .min(1900, 'Reporting year must be 1900 or later')
    .max(2100, 'Reporting year must be 2100 or earlier'),
  custom_metrics_schema: z.record(z.any()).optional().nullable(),
});

export const esgRecordSchema = z.object({
  record_date: z.string().min(1, 'Record date is required').regex(
    /^\d{4}-\d{2}(-\d{2})?$/,
    'Date must be in YYYY-MM-DD or YYYY-MM format'
  ),
  energy_consumption: z.coerce.number().min(0, 'Energy consumption cannot be negative'),
  water_consumption: z.coerce.number().min(0, 'Water consumption cannot be negative'),
  waste_generated: z.coerce.number().min(0, 'Waste generated cannot be negative'),
  waste_recycled: z.coerce.number().min(0, 'Waste recycled cannot be negative'),
  carbon_emissions: z.coerce.number().min(0, 'Carbon emissions cannot be negative'),
  renewable_energy_percentage: z.coerce
    .number()
    .min(0, 'Renewable energy % must be between 0 and 100')
    .max(100, 'Renewable energy % must be between 0 and 100'),
  employees: z.coerce
    .number()
    .int('Employees must be an integer')
    .min(1, 'Number of employees must be at least 1'),
  training_hours: z.coerce.number().min(0, 'Training hours cannot be negative'),
  safety_incidents: z.coerce
    .number()
    .int('Safety incidents must be an integer')
    .min(0, 'Safety incidents cannot be negative'),
  community_initiatives: z.coerce
    .number()
    .int('Community initiatives must be an integer')
    .min(0, 'Community initiatives cannot be negative'),
  compliance_percentage: z.coerce
    .number()
    .min(0, 'Compliance % must be between 0 and 100')
    .max(100, 'Compliance % must be between 0 and 100'),
  ethics_incidents: z.coerce
    .number()
    .int('Ethics incidents must be an integer')
    .min(0, 'Ethics incidents cannot be negative'),
  governance_score: z.coerce
    .number()
    .min(0, 'Governance score must be between 0 and 100')
    .max(100, 'Governance score must be between 0 and 100'),
  custom_metrics: z.record(z.any()).optional(),
}).refine(data => data.waste_recycled <= data.waste_generated, {
  message: 'Waste recycled cannot exceed total waste generated',
  path: ['waste_recycled'],
});

export function validateOrganization(req: Request, res: Response, next: NextFunction) {
  const result = organizationSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: 'Validation Error',
      details: result.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
    });
  }
  req.body = result.data;
  next();
}

export function validateESGRecord(req: Request, res: Response, next: NextFunction) {
  const result = esgRecordSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: 'Validation Error',
      details: result.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
    });
  }
  req.body = result.data;
  next();
}

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters long').max(100, 'Name cannot exceed 100 characters'),
  email: z.string().trim().email('Please enter a valid email address').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password cannot exceed 128 characters'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export function validateRegister(req: Request, res: Response, next: NextFunction) {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: 'Validation Error',
      details: result.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
    });
  }
  req.body = result.data;
  next();
}

export function validateLogin(req: Request, res: Response, next: NextFunction) {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: 'Validation Error',
      details: result.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
    });
  }
  req.body = result.data;
  next();
}

