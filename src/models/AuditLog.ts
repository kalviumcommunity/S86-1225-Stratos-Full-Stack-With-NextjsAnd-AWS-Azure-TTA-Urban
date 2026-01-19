import mongoose, { Schema, Document, Model } from 'mongoose';
import { AuditAction } from '@/utils/constants';

export interface IAuditLog extends Document {
  _id: mongoose.Types.ObjectId;
  action: AuditAction;
  entity: string;
  entityId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  userRole: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: {
      type: String,
      required: true,
      enum: ['CREATE', 'UPDATE', 'DELETE', 'ASSIGN', 'STATUS_CHANGE', 'LOGIN', 'LOGOUT'],
    },
    entity: {
      type: String,
      required: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userRole: {
      type: String,
      required: true,
    },
    changes: {
      type: Schema.Types.Mixed,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ entity: 1, entityId: 1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ createdAt: -1 });

const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export default AuditLog;
