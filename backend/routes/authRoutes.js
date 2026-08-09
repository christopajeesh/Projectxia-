import express from 'express';
import {
  registerUser,
  loginUser,
  googleSignIn,
  demoLogin,
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
  quickRegisterLogin,
  getMe,
  logLogoutActivity,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/google', googleSignIn);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/quick-register-login', quickRegisterLogin);
router.post('/demo-login', demoLogin);
router.post('/logout-activity', logLogoutActivity);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.get('/me', protect, getMe);

export default router;
