import mongoose from 'mongoose';

const agencyLeadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide client name'],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: 'client@engineering.in',
    },
    mobile: {
      type: String,
      required: [true, 'Please provide WhatsApp mobile number'],
      trim: true,
    },
    dept: {
      type: String,
      default: 'Computer Science (CSE / IT)',
    },
    projectType: {
      type: String,
      default: 'Full-Stack Web / Mobile App',
    },
    budget: {
      type: String,
      default: '₹10,000 - ₹25,000',
    },
    description: {
      type: String,
      required: [true, 'Please provide project description'],
    },
    userId: {
      type: String,
      default: '',
      index: true,
    },
    type: {
      type: String,
      enum: ['IDEA_SUBMISSION', 'CALLBACK_REQUEST', 'CUSTOM_BUILD', 'GENERAL_INQUIRY'],
      default: 'CUSTOM_BUILD',
    },
    consultationMode: {
      type: String,
      enum: ['PHONE_CALL', 'WHATSAPP', 'GOOGLE_MEET'],
      default: 'PHONE_CALL',
    },
    preferredTimeSlot: {
      type: String,
      default: 'Flexible (Anytime 10 AM - 8 PM)',
    },
    targetDeadline: {
      type: String,
      default: '2-3 Weeks',
    },
    techPreferences: {
      type: [String],
      default: ['React', 'Node.js', 'Python', 'AI/ML'],
    },
    docLink: {
      type: String,
      default: '',
    },
    assignedTeam: {
      type: String,
      default: 'ProjectXia Core Developing Team',
    },
    milestones: [
      {
        phase: Number,
        title: String,
        percentage: Number,
        amount: Number,
        status: {
          type: String,
          default: 'PENDING',
        },
      },
    ],
    status: {
      type: String,
      enum: ['PENDING_REVIEW', 'CALLBACK_SCHEDULED', 'CONTACTED', 'IN_DEVELOPMENT', 'COMPLETED', 'ARCHIVED'],
      default: 'PENDING_REVIEW',
    },
    dispatchedTo: {
      type: String,
      default: 'theprojectxia@gmail.com',
    },
    emailCopyStatus: {
      type: String,
      default: 'DISPATCHED_TO_THEPROJECTXIA@GMAIL.COM',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.AgencyLead || mongoose.model('AgencyLead', agencyLeadSchema);
