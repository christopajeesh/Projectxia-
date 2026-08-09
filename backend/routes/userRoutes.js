import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getDashboardStats,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile/:id', getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/dashboard-stats', protect, getDashboardStats);

export default router;
