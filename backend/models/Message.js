import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    sender: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      avatar: { type: String },
    },
    receiverId: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      trim: true,
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'voice', 'project_card', 'code_snippet'],
      default: 'text',
    },
    mediaUrl: {
      type: String,
    },
    fileName: {
      type: String,
    },
    fileSize: {
      type: String,
    },
    projectData: {
      projectId: String,
      title: String,
      category: String,
      price: Number,
      trustScore: Number,
    },
    codeData: {
      language: String,
      code: String,
    },
    audioDuration: {
      type: Number, // in seconds for voice notes
    },
    reactions: [
      {
        emoji: String,
        userId: String,
      },
    ],
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    replyTo: {
      messageId: String,
      text: String,
      senderName: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Message || mongoose.model('Message', messageSchema);
