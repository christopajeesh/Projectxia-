import express from 'express';
import {
  getConversations,
  getMessages,
  sendMessage,
  reactMessage,
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/conversations', protect, getConversations);
router.get('/messages/:conversationId', protect, getMessages);
router.post('/messages', protect, sendMessage);
router.post('/messages/:id/react', protect, reactMessage);

export default router;
