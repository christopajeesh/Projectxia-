import express from 'express';
import {
  submitCustomInquiry,
  getMyInquiries,
  getAgencyQuotes,
  releaseMilestone,
} from '../controllers/agencyController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public & Logged-in user routes
router.post('/inquire', optionalProtect, submitCustomInquiry);
router.post('/share-idea-callback', optionalProtect, submitCustomInquiry);
router.get('/my-inquiries', protect, getMyInquiries);

// Quotes & Milestones
router.get('/quotes', getAgencyQuotes);
router.post('/milestones/:id/release', releaseMilestone);

export default router;
