import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      index: true,
    },

    category: {
      type: String,

      enum: [
        'SECURITY_SHIELD',
        'AUTH_EVENT',
        'AUTH_AUDIT',
        'PROJECT_MODERATION',
        'KYC_VERIFY',
        'SCAM_DETECTION',
        'SYSTEM_CONFIG',
        'AGENCY_PIPELINE',
        'GLOBAL_ANNOUNCEMENT',
      ],

      default: 'AUTH_EVENT',

      index: true,
    },

    performedBy: {
      id: String,
      name: String,
      email: String,
      role: String,
    },

    targetEntity: {
      entityType: String,
      entityId: String,
      title: String,
    },

    ipAddress: {
      type: String,
      default: 'unknown',
    },

    userAgent: {
      type: String,
      default: 'Unknown Browser',
    },

    threatLevel: {
      type: String,

      enum: [
        'CLEAN',
        'INFO',
        'LOW',
        'MEDIUM',
        'CRITICAL_BLOCKED',
      ],

      default: 'CLEAN',
    },

    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },

  {
    timestamps: true,
  }
);

export default
  mongoose.models.AuditLog ||
  mongoose.model(
    'AuditLog',
    auditLogSchema
  );