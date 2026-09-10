import { Router } from 'express';
import {
  deleteRecord,
  getRecordById,
  updateRecord,
} from '../controllers/esgRecordController';
import { validateESGRecord } from '../middleware/validation';

const router = Router();

router.get('/:id', getRecordById);
router.put('/:id', validateESGRecord, updateRecord);
router.delete('/:id', deleteRecord);

export default router;
