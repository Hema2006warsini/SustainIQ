import { Router } from 'express';
import organizationRoutes from './organizationRoutes';
import esgRecordRoutes from './esgRecordRoutes';
import { getSystemHealth } from '../controllers/dashboardController';

const router = Router();

router.get('/health', getSystemHealth);
router.use('/organizations', organizationRoutes);
router.use('/esg', esgRecordRoutes);

export default router;
