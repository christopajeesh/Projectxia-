import { memoryStore } from '../seed/seedData.js';

// @desc    Get all conversations for the active user
// @route   GET /api/chat/conversations
export const getConversations = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || 'user_001_buyer';
    const userEmail = (req.user?.email || '').toLowerCase();

    if (!memoryStore.conversations) {
      memoryStore.conversations = [];
    }

    // Filter conversations where active user is a participant
    const userConvs = memoryStore.conversations.filter(c =>
      c.participants.some(p => p.userId === userId || (userEmail && p.email?.toLowerCase() === userEmail))
    );

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

    // If empty, auto-generate welcome message for new conversation ID
    if (messages.length === 0 && conversationId) {
      const conv = (memoryStore.conversations || []).find(c => c._id === conversationId);
      const seedMsg = {
        _id: `msg_auto_${Date.now()}`,
        conversationId,
        sender: {
          id: conv?.participants?.[1]?.userId || 'user_002_creator',
          name: conv?.participants?.[1]?.name || 'Dr. Priya Venkatesh',
          avatar: conv?.participants?.[1]?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
        },
        receiverId: req.user?._id || req.user?.id || 'user_001_buyer',
        text: conv?.lastMessage?.text || 'Direct project discussion initiated. Ask any questions or negotiate terms directly.',
        messageType: 'text',
        isRead: true,
        createdAt: conv?.createdAt || new Date(),
      };
      if (!memoryStore.messages) memoryStore.messages = [];
      memoryStore.messages.push(seedMsg);
      messages = [seedMsg];
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

    // If conversation does not exist, create one preserving targetConvId
    let conversation = memoryStore.conversations.find(c => c._id === targetConvId);
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
        projectContext: projectData || {
          projectId: 'proj_001_neuromesh',
          title: 'NeuroMesh AI: Autonomous Edge Vision',
          price: 3999,
        },
        lastMessage: {
          text: text || 'Sent an attachment',
          senderId: sender.id,
          createdAt: new Date(),
          readBy: [sender.id],
        },
        unreadCount: {},
      };
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

    memoryStore.messages.push(newMessage);

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

    const message = memoryStore.messages.find(m => m._id === id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }

    if (!message.reactions) message.reactions = [];

    const existingIndex = message.reactions.findIndex(r => r.userId === userId && r.emoji === emoji);
    if (existingIndex > -1) {
      message.reactions.splice(existingIndex, 1);
    } else {
      message.reactions.push({ emoji, userId });
    }

    res.json({
      success: true,
      reactions: message.reactions,
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

    res.json({
      success: true,
      message: 'Conversation deleted successfully.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
