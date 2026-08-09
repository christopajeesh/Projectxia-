import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['message', 'project_upload', 'security_shield', 'collaboration', 'system', 'purchase'],
      default: 'system',
    },
    actionUrl: {
      type: String,
      default: '/dashboard',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    iconType: {
      type: String,
      default: 'bell',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
