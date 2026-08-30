import { memoryStore } from '../seed/seedData.js';

export const initChatSocket = (io) => {
  const onlineUsers = new Map(); // userId -> socketId

  io.on('connection', (socket) => {
    console.log(`[ProjectXia Socket] Node connected: ${socket.id}`);

    // User joins with authentication
    socket.on('join_presence', (user) => {
      if (user && (user.id || user._id || user.email)) {
        const uid = String(user.id || user._id || user.email);
        const email = String(user.email || '').toLowerCase().trim();

        if (uid) onlineUsers.set(uid, socket.id);
        if (email) onlineUsers.set(email, socket.id);
        socket.userId = uid;
        socket.userEmail = email;
        socket.userName = user.name || 'Verified User';

        // Join individual user rooms by ID and Email for targeted messaging
        if (uid) socket.join(uid);
        if (email) socket.join(email);

        io.emit('online_users_update', Array.from(onlineUsers.keys()));
        console.log(`[ProjectXia Socket] User ${user.name} (${email}) joined socket rooms: [${uid}, ${email}]`);
      }
    });

    // Join specific conversation room
    socket.on('join_conversation', (conversationId) => {
      if (conversationId) {
        socket.join(String(conversationId));
        console.log(`[ProjectXia Socket] Socket ${socket.id} joined conversation room: ${conversationId}`);
      }
    });

    // Real-time message dispatch (Supports bidirectional reply)
    socket.on('send_message', (data) => {
      if (!data) return;

      const messageObj = data.message || data;
      const convId = String(data.conversationId || messageObj.conversationId || '');
      const recId = String(data.receiverId || messageObj.receiverId || '');
      const recEmail = String(data.receiverEmail || messageObj.receiverEmail || '').toLowerCase().trim();

      console.log(`[ProjectXia Socket] Relaying message in conv: ${convId} to recId: ${recId}, recEmail: ${recEmail}`);

      // 1. Broadcast to conversation room (all open chat windows in this room)
      if (convId) {
        io.to(convId).emit('receive_message', messageObj);
        io.to(convId).emit('conversation_updated', { conversationId: convId, message: messageObj });
      }

      // 2. Direct emit to receiver's user rooms if not currently in conversation room
      if (recId) {
        io.to(recId).emit('receive_message', messageObj);
        io.to(recId).emit('new_message_notification', {
          title: `New message from ${messageObj.sender?.name || 'Creator'}`,
          message: messageObj.text || 'Sent an attachment',
          conversationId: convId,
          senderName: messageObj.sender?.name,
        });
      }

      if (recEmail && recEmail !== recId) {
        io.to(recEmail).emit('receive_message', messageObj);
        io.to(recEmail).emit('new_message_notification', {
          title: `New message from ${messageObj.sender?.name || 'Creator'}`,
          message: messageObj.text || 'Sent an attachment',
          conversationId: convId,
          senderName: messageObj.sender?.name,
        });
      }
    });

    // Typing indicators
    socket.on('typing_start', ({ conversationId, userName }) => {
      if (conversationId) {
        socket.to(String(conversationId)).emit('user_typing', { userName, isTyping: true });
      }
    });

    socket.on('typing_stop', ({ conversationId }) => {
      if (conversationId) {
        socket.to(String(conversationId)).emit('user_typing', { isTyping: false });
      }
    });

    // WhatsApp Read Receipts (Blue Ticks trigger when recipient views conversation)
    socket.on('mark_read', ({ conversationId, userId, userEmail }) => {
      if (!conversationId) return;
      const strUser = String(userId || socket.userId || '').toLowerCase().trim();
      const strEmail = String(userEmail || socket.userEmail || '').toLowerCase().trim();

      (memoryStore.messages || []).forEach((m) => {
        const sId = String(m.sender?.id || m.sender?._id || '').toLowerCase().trim();
        const sEmail = String(m.sender?.email || '').toLowerCase().trim();

        if (m.conversationId === conversationId && (sId !== strUser && sEmail !== strEmail)) {
          m.isRead = true;
        }
      });
      io.to(String(conversationId)).emit('messages_read', { conversationId, readerId: strUser, readerEmail: strEmail });
    });

    // Handle single message deletion in real-time
    socket.on('delete_message', ({ messageId, conversationId }) => {
      if (!messageId) return;
      if (memoryStore.messages) {
        memoryStore.messages = memoryStore.messages.filter((m) => String(m._id || m.id) !== String(messageId));
      }
      if (conversationId) {
        io.to(String(conversationId)).emit('message_deleted', { messageId, conversationId });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit('online_users_update', Array.from(onlineUsers.keys()));
        console.log(`[ProjectXia Socket] User disconnected: ${socket.userId}`);
      }
    });
  });
};
