import express from 'express';
import {
  analyzeCodeAndProject,
  reportSuspiciousEntity,
} from '../controllers/securityController.js';
import { aiScannerLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/scan', aiScannerLimiter, analyzeCodeAndProject);
router.post('/report', reportSuspiciousEntity);

export default router;
