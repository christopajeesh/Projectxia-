import express from 'express';
import {
  generateDownloadToken,
  downloadProjectArchive,
  getCommercialCertificate,
} from '../controllers/licenseController.js';

const router = express.Router();

router.post('/token/:projectId', generateDownloadToken);
router.get('/download/:token', downloadProjectArchive);
router.get('/certificate/:licenseKey', getCommercialCertificate);

export default router;
