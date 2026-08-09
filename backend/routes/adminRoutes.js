import express from 'express';
import {
  getAdminMetrics,
  getAllUsers,
  toggleUserBan,
  submitAgencyRequest,
  getAgencyLeads,
  getActivityLogs,
  broadcastAlert,
} from '../controllers/adminController.js';
import { protect, authorizeOwner } from '../middleware/authMiddleware.js';

const router = express.Router();

// Publicly submit agency request (dispatches to theprojectxia@gmail.com)
router.post('/agency-request', submitAgencyRequest);

// Strictly protected routes exclusive to theprojectxia@gmail.com
router.get('/metrics', protect, authorizeOwner, getAdminMetrics);
router.get('/users', protect, authorizeOwner, getAllUsers);
router.put('/users/:id/ban', protect, authorizeOwner, toggleUserBan);
router.get('/agency-leads', protect, authorizeOwner, getAgencyLeads);
router.get('/activity-logs', protect, authorizeOwner, getActivityLogs);
router.post('/broadcast', protect, authorizeOwner, broadcastAlert);

export default router;
