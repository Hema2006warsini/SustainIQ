import { Router } from 'express';
import {
  createOrganization,
  deleteOrganization,
  getOrganizationById,
  getOrganizations,
  updateOrganization,
} from '../controllers/organizationController';
import { createRecord, getRecordsByOrg } from '../controllers/esgRecordController';
import { getDashboard } from '../controllers/dashboardController';
import { downloadPdfReport } from '../controllers/reportController';
import { validateESGRecord, validateOrganization } from '../middleware/validation';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Protect all organization & nested ESG/dashboard routes with authentication
router.use(requireAuth);

// Organization CRUD
router.get('/', getOrganizations);
router.post('/', validateOrganization, createOrganization);
router.get('/:id', getOrganizationById);
router.put('/:id', validateOrganization, updateOrganization);
router.delete('/:id', deleteOrganization);

// Organization-nested ESG and Dashboard routes
router.get('/:orgId/esg', getRecordsByOrg);
router.post('/:orgId/esg', validateESGRecord, createRecord);
router.get('/:orgId/dashboard', getDashboard);
router.get('/:orgId/reports/pdf', downloadPdfReport);

export default router;
