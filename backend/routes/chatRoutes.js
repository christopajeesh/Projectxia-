import express from 'express';
import {
  getConversations,
  getMessages,
  sendMessage,
  reactMessage,
  markMessagesRead,
  deleteConversation,
  getAvailableUsers,
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/users', protect, getAvailableUsers);
router.get('/conversations', protect, getConversations);
router.delete('/conversations/:id', protect, deleteConversation);
router.get('/messages/:conversationId', protect, getMessages);
router.post('/messages', protect, sendMessage);
router.post('/messages/:id/react', protect, reactMessage);
router.put('/messages/read/:conversationId', protect, markMessagesRead);

export default router;
