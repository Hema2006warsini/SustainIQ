import { Router } from 'express';
import authRoutes from './authRoutes';
import organizationRoutes from './organizationRoutes';
import esgRecordRoutes from './esgRecordRoutes';
import { getSystemHealth } from '../controllers/dashboardController';

const router = Router();

router.get('/health', getSystemHealth);
router.use('/auth', authRoutes);
router.use('/organizations', organizationRoutes);
router.use('/esg', esgRecordRoutes);

export default router;
