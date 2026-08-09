import express from 'express';
import {
  updateCreatorKYC,
  getEarningsSummary,
  requestPayout,
} from '../controllers/payoutController.js';

const router = express.Router();

router.post('/kyc', updateCreatorKYC);
router.get('/earnings', getEarningsSummary);
router.post('/withdraw', requestPayout);

export default router;
