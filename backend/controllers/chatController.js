import { memoryStore } from '../seed/seedData.js';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

// @desc    Get all conversations for the active user
// @route   GET /api/chat/conversations
export const getConversations = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || 'user_001_buyer';
    const userEmail = (req.user?.email || '').toLowerCase();

    if (!memoryStore.conversations) {
      memoryStore.conversations = [];
    }

    let userConvs = memoryStore.conversations.filter(c =>
      c.participants.some(p => p.userId === userId || (userEmail && p.email?.toLowerCase() === userEmail))
    );

    // Also fetch from MongoDB database if available
    try {
      const dbConvs = await Conversation.find({
        $or: [
          { 'participants.userId': userId },
          { 'participants.email': userEmail }
        ]
      }).sort({ updatedAt: -1 }).lean();

      if (dbConvs && dbConvs.length > 0) {
        const mergedMap = new Map();
        [...dbConvs, ...userConvs].forEach(c => {
          if (!mergedMap.has(String(c._id))) {
            mergedMap.set(String(c._id), c);
          }
        });
        userConvs = Array.from(mergedMap.values());
      }
    } catch (dbErr) {
      console.warn('MongoDB conversation query fallback to memoryStore:', dbErr.message);
    }

    res.json({
      success: true,
      conversations: userConvs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all messages for a conversation
// @route   GET /api/chat/messages/:conversationId
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    let messages = (memoryStore.messages || []).filter(m => m.conversationId === conversationId && !m.isDeleted);

    // Fetch from MongoDB database
    try {
      const dbMsgs = await Message.find({ conversationId, isDeleted: { $ne: true } }).sort({ createdAt: 1 }).lean();
      if (dbMsgs && dbMsgs.length > 0) {
        const msgMap = new Map();
        [...messages, ...dbMsgs].forEach(m => {
          const key = String(m._id || m.id);
          msgMap.set(key, m);
        });
        messages = Array.from(msgMap.values());
      }
    } catch (dbErr) {
      console.warn('MongoDB message query fallback to memoryStore:', dbErr.message);
    }

    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send a new real-time message with attachments/voice/project card
// @route   POST /api/chat/messages
export const sendMessage = async (req, res) => {
  try {
    const {
      conversationId,
      receiverId,
      text,
      messageType,
      mediaUrl,
      fileName,
      projectData,
      codeData,
      audioDuration,
    } = req.body;

    const sender = {
      id: req.user?._id || req.user?.id || 'user_001_buyer',
      name: req.user?.name || 'Verified User',
      avatar: req.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    };

    let targetConvId = conversationId || `conv_${Date.now()}`;

    // Update memoryStore conversation
    let conversation = (memoryStore.conversations || []).find(c => c._id === targetConvId);
    if (!conversation) {
      conversation = {
        _id: targetConvId,
        participants: [
          {
            userId: sender.id,
            name: sender.name,
            avatar: sender.avatar,
            role: req.user?.role || 'user',
            isOnline: true,
            lastSeen: new Date(),
          },
          {
            userId: receiverId || 'user_002_creator',
            name: 'Dr. Priya Venkatesh',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
            role: 'creator',
            isOnline: true,
            lastSeen: new Date(),
          },
        ],
        projectContext: projectData || null,
        lastMessage: {
          text: text || 'Sent an attachment',
          senderId: sender.id,
          createdAt: new Date(),
          readBy: [sender.id],
        },
        unreadCount: {},
      };
      if (!memoryStore.conversations) memoryStore.conversations = [];
      memoryStore.conversations.unshift(conversation);
    } else {
      conversation.lastMessage = {
        text: text || 'Sent an attachment',
        senderId: sender.id,
        createdAt: new Date(),
        readBy: [sender.id],
      };
    }

    const newMessage = {
      _id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      conversationId: targetConvId,
      sender,
      receiverId: receiverId || 'user_002_creator',
      text: text || '',
      messageType: messageType || 'text',
      mediaUrl,
      fileName,
      projectData,
      codeData,
      audioDuration,
      reactions: [],
      isRead: false,
      createdAt: new Date(),
    };

    if (!memoryStore.messages) memoryStore.messages = [];
    memoryStore.messages.push(newMessage);

    // Save to MongoDB Database
    try {
      await Message.create({
        _id: newMessage._id,
        conversationId: targetConvId,
        sender,
        receiverId: newMessage.receiverId,
        text: newMessage.text,
        messageType: newMessage.messageType,
        mediaUrl: newMessage.mediaUrl,
        fileName: newMessage.fileName,
        projectData: newMessage.projectData,
        codeData: newMessage.codeData,
        audioDuration: newMessage.audioDuration,
        isRead: false,
      });

      await Conversation.findByIdAndUpdate(
        targetConvId,
        {
          _id: targetConvId,
          participants: conversation.participants,
          projectContext: conversation.projectContext,
          lastMessage: conversation.lastMessage,
          updatedAt: new Date(),
        },
        { upsert: true, new: true }
      );
    } catch (dbErr) {
      console.warn('MongoDB message insert fallback:', dbErr.message);
    }

    res.status(201).json({
      success: true,
      message: newMessage,
      conversation,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle reaction on a message
// @route   POST /api/chat/messages/:id/react
export const reactMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;
    const userId = req.user?._id || req.user?.id || 'user_001_buyer';

    const message = (memoryStore.messages || []).find(m => m._id === id);
    if (message) {
      if (!message.reactions) message.reactions = [];
      const existingIndex = message.reactions.findIndex(r => r.userId === userId && r.emoji === emoji);
      if (existingIndex > -1) {
        message.reactions.splice(existingIndex, 1);
      } else {
        message.reactions.push({ emoji, userId });
      }
    }

    try {
      const dbMsg = await Message.findById(id);
      if (dbMsg) {
        const existingIndex = dbMsg.reactions.findIndex(r => r.userId === userId && r.emoji === emoji);
        if (existingIndex > -1) {
          dbMsg.reactions.splice(existingIndex, 1);
        } else {
          dbMsg.reactions.push({ emoji, userId });
        }
        await dbMsg.save();
      }
    } catch (dbErr) {
      console.warn('MongoDB reaction update fallback:', dbErr.message);
    }

    res.json({
      success: true,
      reactions: message ? message.reactions : [],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark all messages in conversation as read (WhatsApp Blue Ticks trigger)
// @route   PUT /api/chat/messages/read/:conversationId
export const markMessagesRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?._id || req.user?.id || 'user_001_buyer';

    (memoryStore.messages || []).forEach((m) => {
      if (m.conversationId === conversationId && (m.receiverId === userId || m.sender?.id !== userId)) {
        m.isRead = true;
      }
    });

    try {
      await Message.updateMany(
        { conversationId, isRead: false },
        { $set: { isRead: true, readAt: new Date() } }
      );
    } catch (dbErr) {
      console.warn('MongoDB mark read fallback:', dbErr.message);
    }

    res.json({ success: true, message: 'Conversation marked as read.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a conversation permanently
// @route   DELETE /api/chat/conversations/:id
export const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;

    if (memoryStore.conversations) {
      memoryStore.conversations = memoryStore.conversations.filter(c => c._id !== id);
    }
    if (memoryStore.messages) {
      memoryStore.messages = memoryStore.messages.filter(m => m.conversationId !== id);
    }

    try {
      await Conversation.deleteOne({ _id: id });
      await Message.deleteMany({ conversationId: id });
    } catch (dbErr) {
      console.warn('MongoDB delete conversation fallback:', dbErr.message);
    }

    res.json({
      success: true,
      message: 'Conversation deleted successfully.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
