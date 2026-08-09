import express from 'express';
import { scanCodeFile, getAuditReport } from '../controllers/aiShieldController.js';

const router = express.Router();

router.post('/scan', scanCodeFile);
router.get('/report/:scanId', getAuditReport);

export default router;
