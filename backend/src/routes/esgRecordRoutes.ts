import { Router } from 'express';
import {
  deleteRecord,
  getRecordById,
  updateRecord,
} from '../controllers/esgRecordController';
import { validateESGRecord } from '../middleware/validation';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Protect all direct record routes
router.use(requireAuth);

router.get('/:id', getRecordById);
router.put('/:id', validateESGRecord, updateRecord);
router.delete('/:id', deleteRecord);

export default router;
