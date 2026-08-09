import express from 'express';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  createStripeSession,
  handlePaymentWebhook,
} from '../controllers/paymentController.js';

const router = express.Router();

router.post('/razorpay-order', createRazorpayOrder);
router.post('/verify-razorpay', verifyRazorpayPayment);
router.post('/stripe-session', createStripeSession);
router.post('/webhook', handlePaymentWebhook);

export default router;
