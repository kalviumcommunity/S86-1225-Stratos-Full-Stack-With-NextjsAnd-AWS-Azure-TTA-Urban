import Complaint, { IComplaint } from '@/models/Complaint';
import connectDB from '@/lib/db';
import { ComplaintStatus, ComplaintCategory, COMPLAINT_STATUS } from '@/utils/constants';
import { generateComplaintId } from '@/utils/generateComplaintId';
import { DEFAULT_SLA } from '@/utils/constants';

export interface CreateComplaintParams {
  title: string;
  description: string;
  category: ComplaintCategory;
  images?: string[];
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  createdBy: string;
}

export interface UpdateComplaintStatusParams {
  complaintId: string;
  status: ComplaintStatus;
  changedBy: string;
  notes?: string;
  resolutionProof?: string[];
  resolutionNotes?: string;
}

export class ComplaintService {
  /**
   * Create a new complaint
   */
  static async createComplaint(params: CreateComplaintParams): Promise<IComplaint> {
    await connectDB();

    // Get the last complaint to generate a new ID
    const lastComplaint = await Complaint.findOne().sort({ createdAt: -1 });
    const sequenceNumber = lastComplaint ? (await Complaint.countDocuments()) + 1 : 1;
    const complaintId = generateComplaintId(sequenceNumber);

    // Calculate SLA deadline
    const slaHours = DEFAULT_SLA[params.category] || 72;
    const slaDeadline = new Date();
    slaDeadline.setHours(slaDeadline.getHours() + slaHours);

    // Create complaint
    const complaint = await Complaint.create({
      ...params,
      complaintId,
      status: COMPLAINT_STATUS.NEW,
      slaDeadline,
      statusHistory: [
        {
          status: COMPLAINT_STATUS.NEW,
          changedBy: params.createdBy,
          changedAt: new Date(),
          notes: 'Complaint created',
        },
      ],
    });

    return complaint;
  }

  /**
   * Get complaint by ID
   */
  static async getComplaintById(id: string): Promise<IComplaint | null> {
    await connectDB();

    const complaint = await Complaint.findById(id)
      .populate('createdBy', 'name email phone')
      .populate('assignedTo', 'name email phone department')
      .lean();

    return complaint as IComplaint | null;
  }

  /**
   * Get complaint by complaint ID
   */
  static async getComplaintByComplaintId(complaintId: string): Promise<IComplaint | null> {
    await connectDB();

    const complaint = await Complaint.findOne({ complaintId })
      .populate('createdBy', 'name email phone')
      .populate('assignedTo', 'name email phone department')
      .lean();

    return complaint as IComplaint | null;
  }

  /**
   * Get complaints with filters and pagination
   */
  static async getComplaints(filters: {
    status?: ComplaintStatus;
    category?: ComplaintCategory;
    createdBy?: string;
    assignedTo?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ complaints: IComplaint[]; total: number; page: number; totalPages: number }> {
    await connectDB();

    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      ...queryFilters
    } = filters;

    const query: any = {};

    if (queryFilters.status) query.status = queryFilters.status;
    if (queryFilters.category) query.category = queryFilters.category;
    if (queryFilters.createdBy) query.createdBy = queryFilters.createdBy;
    if (queryFilters.assignedTo) query.assignedTo = queryFilters.assignedTo;

    const skip = (page - 1) * limit;
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [complaints, total] = await Promise.all([
      Complaint.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email')
        .populate('assignedTo', 'name email department')
        .lean(),
      Complaint.countDocuments(query),
    ]);

    return {
      complaints: complaints as IComplaint[],
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update complaint status
   */
  static async updateStatus(params: UpdateComplaintStatusParams): Promise<IComplaint | null> {
    await connectDB();

    const complaint = await Complaint.findById(params.complaintId);

    if (!complaint) {
      throw new Error('Complaint not found');
    }

    const updateData: any = {
      status: params.status,
      $push: {
        statusHistory: {
          status: params.status,
          changedBy: params.changedBy,
          changedAt: new Date(),
          notes: params.notes,
        },
      },
    };

    // If status is RESOLVED, add resolution data
    if (params.status === COMPLAINT_STATUS.RESOLVED) {
      updateData.resolvedAt = new Date();
      updateData.isSlaMet = new Date() <= complaint.slaDeadline;

      if (params.resolutionProof) {
        updateData.resolutionProof = params.resolutionProof;
      }
      if (params.resolutionNotes) {
        updateData.resolutionNotes = params.resolutionNotes;
      }
    }

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      params.complaintId,
      updateData,
      { new: true }
    )
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email department')
      .lean();

    return updatedComplaint as IComplaint | null;
  }

  /**
   * Assign complaint to officer
   */
  static async assignComplaint(
    complaintId: string,
    officerId: string,
    assignedBy: string,
    notes?: string
  ): Promise<IComplaint | null> {
    await connectDB();

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      complaintId,
      {
        assignedTo: officerId,
        status: COMPLAINT_STATUS.ASSIGNED,
        $push: {
          statusHistory: {
            status: COMPLAINT_STATUS.ASSIGNED,
            changedBy: assignedBy,
            changedAt: new Date(),
            notes: notes || 'Complaint assigned to officer',
          },
        },
      },
      { new: true }
    )
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email department')
      .lean();

    return updatedComplaint as IComplaint | null;
  }

  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(userId?: string, role?: string): Promise<any> {
    await connectDB();

    const baseQuery: any = userId && role === 'OFFICER' ? { assignedTo: userId } : {};

    const [
      total,
      newCount,
      assignedCount,
      inProgressCount,
      resolvedCount,
      closedCount,
      slaBreached,
    ] = await Promise.all([
      Complaint.countDocuments(baseQuery),
      Complaint.countDocuments({ ...baseQuery, status: COMPLAINT_STATUS.NEW }),
      Complaint.countDocuments({ ...baseQuery, status: COMPLAINT_STATUS.ASSIGNED }),
      Complaint.countDocuments({ ...baseQuery, status: COMPLAINT_STATUS.IN_PROGRESS }),
      Complaint.countDocuments({ ...baseQuery, status: COMPLAINT_STATUS.RESOLVED }),
      Complaint.countDocuments({ ...baseQuery, status: COMPLAINT_STATUS.CLOSED }),
      Complaint.countDocuments({
        ...baseQuery,
        slaDeadline: { $lt: new Date() },
        status: { $nin: [COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.CLOSED] },
      }),
    ]);

    // Category-wise breakdown
    const categoryStats = await Complaint.aggregate([
      { $match: baseQuery },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      total,
      byStatus: {
        new: newCount,
        assigned: assignedCount,
        inProgress: inProgressCount,
        resolved: resolvedCount,
        closed: closedCount,
      },
      slaBreached,
      byCategory: categoryStats.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    };
  }

  /**
   * Get public dashboard statistics
   */
  static async getPublicStats(): Promise<any> {
    await connectDB();

    const [total, resolved, inProgress, avgResolutionTime] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({
        status: { $in: [COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.CLOSED] },
      }),
      Complaint.countDocuments({
        status: { $in: [COMPLAINT_STATUS.ASSIGNED, COMPLAINT_STATUS.IN_PROGRESS] },
      }),
      Complaint.aggregate([
        {
          $match: {
            status: { $in: [COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.CLOSED] },
            resolvedAt: { $exists: true },
          },
        },
        {
          $project: {
            resolutionTime: {
              $divide: [{ $subtract: ['$resolvedAt', '$createdAt'] }, 1000 * 60 * 60], // hours
            },
          },
        },
        {
          $group: {
            _id: null,
            avgTime: { $avg: '$resolutionTime' },
          },
        },
      ]),
    ]);

    return {
      total,
      resolved,
      inProgress,
      avgResolutionTime: avgResolutionTime[0]?.avgTime || 0,
    };
  }

  /**
   * Search complaints
   */
  static async searchComplaints(
    searchTerm: string,
    filters?: any
  ): Promise<IComplaint[]> {
    await connectDB();

    const query: any = {
      $or: [
        { complaintId: { $regex: searchTerm, $options: 'i' } },
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
      ],
      ...filters,
    };

    const complaints = await Complaint.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email department')
      .lean();

    return complaints as IComplaint[];
  }
}
