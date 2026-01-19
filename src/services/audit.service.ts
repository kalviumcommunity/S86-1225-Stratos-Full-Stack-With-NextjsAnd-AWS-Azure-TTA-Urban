import AuditLog, { IAuditLog } from '@/models/AuditLog';
import { AuditAction } from '@/utils/constants';
import connectDB from '@/lib/db';

export interface CreateAuditLogParams {
  action: AuditAction;
  entity: string;
  entityId?: string;
  userId: string;
  userName: string;
  userRole: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  /**
   * Create a new audit log entry
   */
  static async createLog(params: CreateAuditLogParams): Promise<IAuditLog> {
    await connectDB();

    const auditLog = await AuditLog.create(params);
    return auditLog;
  }

  /**
   * Get audit logs with filters and pagination
   */
  static async getLogs(filters: {
    userId?: string;
    entity?: string;
    entityId?: string;
    action?: AuditAction;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ logs: IAuditLog[]; total: number; page: number; totalPages: number }> {
    await connectDB();

    const { page = 1, limit = 50, ...queryFilters } = filters;

    // Build query
    const query: any = {};

    if (queryFilters.userId) query.userId = queryFilters.userId;
    if (queryFilters.entity) query.entity = queryFilters.entity;
    if (queryFilters.entityId) query.entityId = queryFilters.entityId;
    if (queryFilters.action) query.action = queryFilters.action;

    if (queryFilters.startDate || queryFilters.endDate) {
      query.createdAt = {};
      if (queryFilters.startDate) query.createdAt.$gte = queryFilters.startDate;
      if (queryFilters.endDate) query.createdAt.$lte = queryFilters.endDate;
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments(query),
    ]);

    return {
      logs: logs as IAuditLog[],
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get logs for a specific complaint
   */
  static async getComplaintLogs(complaintId: string): Promise<IAuditLog[]> {
    await connectDB();

    const logs = await AuditLog.find({
      entity: 'Complaint',
      entityId: complaintId,
    })
      .sort({ createdAt: -1 })
      .lean();

    return logs as IAuditLog[];
  }

  /**
   * Get user activity logs
   */
  static async getUserActivityLogs(
    userId: string,
    limit: number = 100
  ): Promise<IAuditLog[]> {
    await connectDB();

    const logs = await AuditLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return logs as IAuditLog[];
  }
}
