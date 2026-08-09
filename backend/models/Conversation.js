import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        userId: { type: String, required: true },
        name: { type: String, required: true },
        avatar: { type: String },
        role: { type: String, default: 'user' },
        isOnline: { type: Boolean, default: false },
        lastSeen: { type: Date, default: Date.now },
      },
    ],
    lastMessage: {
      text: { type: String, default: '' },
      senderId: { type: String },
      createdAt: { type: Date, default: Date.now },
      readBy: [{ type: String }],
    },
    projectContext: {
      projectId: { type: String },
      title: { type: String },
      price: { type: Number },
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);
