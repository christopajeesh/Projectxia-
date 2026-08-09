export const initChatSocket = (io) => {
  const onlineUsers = new Map(); // userId -> socketId

  io.on('connection', (socket) => {
    console.log(`[ProjectXia Socket] Node connected: ${socket.id}`);

    // User joins with authentication
    socket.on('join_presence', (user) => {
      if (user && (user.id || user._id)) {
        const uid = user.id || user._id;
        onlineUsers.set(uid, socket.id);
        socket.userId = uid;
        socket.userName = user.name;
        io.emit('online_users_update', Array.from(onlineUsers.keys()));
        console.log(`[ProjectXia Socket] User ${user.name} is ONLINE`);
      }
    });

    // Join specific conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`[ProjectXia Socket] Socket ${socket.id} joined room: ${conversationId}`);
    });

    // Real-time message dispatch
    socket.on('send_message', (data) => {
      const { conversationId, message } = data;
      // Broadcast to room
      io.to(conversationId).emit('receive_message', message);
      
      // Also notify receiver if online
      if (message && message.receiverId) {
        const receiverSocketId = onlineUsers.get(message.receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('new_message_notification', {
            title: `New message from ${message.sender?.name || 'Creator'}`,
            message: message.text || 'Sent an attachment',
            conversationId,
          });
        }
      }
    });

    // Typing indicators
    socket.on('typing_start', ({ conversationId, userName }) => {
      socket.to(conversationId).emit('user_typing', { userName, isTyping: true });
    });

    socket.on('typing_stop', ({ conversationId }) => {
      socket.to(conversationId).emit('user_typing', { isTyping: false });
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
