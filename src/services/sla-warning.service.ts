import Complaint from '@/models/Complaint';
import connectDB from '@/lib/db';
import { NotificationService } from './notification.service';

/**
 * Check for complaints approaching SLA deadline and notify officers
 * Sends warning 1 hour before SLA deadline
 */
export class SLAWarningService {
  /**
   * Check and send SLA warning notifications
   * Should be called periodically (e.g., every 15-30 minutes)
   */
  static async checkAndNotifySLAWarnings(): Promise<void> {
    try {
      await connectDB();

      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour in milliseconds

      // Find complaints that:
      // 1. Are not resolved or closed
      // 2. Have SLA deadline between now and 1 hour from now
      // 3. Haven't been warned yet (no SLA warning notification in last 2 hours)
      const complaintsApproachingDeadline = await Complaint.find({
        status: { $nin: ['RESOLVED', 'CLOSED', 'REJECTED'] },
        slaDeadline: {
          $gte: now,
          $lte: oneHourFromNow,
        },
        assignedTo: { $exists: true, $ne: null },
      })
        .populate('assignedTo', '_id name')
        .lean();

      console.log(`Found ${complaintsApproachingDeadline.length} complaints approaching SLA deadline`);

      // Send notifications to officers
      for (const complaint of complaintsApproachingDeadline) {
        if (!complaint.assignedTo) continue;

        const officerId = (complaint.assignedTo as any)._id.toString();
        const officerName = (complaint.assignedTo as any).name;

        // Check if we already sent a warning recently (in last 2 hours)
        const recentWarning = await NotificationService.getUserNotifications(officerId, {
          limit: 50,
        });

        const hasRecentWarning = recentWarning.some(
          (notif) =>
            notif.complaintId?.toString() === complaint._id.toString() &&
            notif.type === 'ALERT' &&
            notif.message.includes('SLA deadline approaching') &&
            new Date(notif.createdAt).getTime() > now.getTime() - 2 * 60 * 60 * 1000
        );

        if (hasRecentWarning) {
          console.log(`Already sent SLA warning for complaint ${complaint.complaintId} recently`);
          continue;
        }

        // Calculate remaining time
        const remainingMinutes = Math.floor(
          (new Date(complaint.slaDeadline!).getTime() - now.getTime()) / (1000 * 60)
        );

        await NotificationService.createNotification({
          userId: officerId,
          type: 'ALERT',
          title: '⚠️ SLA Deadline Approaching!',
          message: `Your assigned complaint "${complaint.title}" (${complaint.complaintId}) has only ${remainingMinutes} minutes remaining before SLA deadline. Please resolve it urgently!`,
          complaintId: complaint._id.toString(),
          metadata: {
            slaDeadline: complaint.slaDeadline,
            remainingMinutes,
            category: complaint.category,
          },
        });

        console.log(
          `Sent SLA warning to officer ${officerName} for complaint ${complaint.complaintId}`
        );
      }

      // Also check for already breached SLAs and send daily reminders
      await this.notifyBreachedSLAs();
    } catch (error) {
      console.error('Error checking SLA warnings:', error);
      throw error;
    }
  }

  /**
   * Notify officers about already breached SLAs
   * Sends notification once per day for breached complaints
   */
  static async notifyBreachedSLAs(): Promise<void> {
    try {
      await connectDB();

      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Find complaints with breached SLA
      const breachedComplaints = await Complaint.find({
        status: { $nin: ['RESOLVED', 'CLOSED', 'REJECTED'] },
        slaDeadline: { $lt: now },
        assignedTo: { $exists: true, $ne: null },
      })
        .populate('assignedTo', '_id name')
        .lean();

      for (const complaint of breachedComplaints) {
        if (!complaint.assignedTo) continue;

        const officerId = (complaint.assignedTo as any)._id.toString();

        // Check if we already sent a breach notification today
        const todayNotifications = await NotificationService.getUserNotifications(officerId, {
          limit: 100,
        });

        const hasTodayNotification = todayNotifications.some(
          (notif) =>
            notif.complaintId?.toString() === complaint._id.toString() &&
            notif.type === 'ALERT' &&
            notif.message.includes('SLA deadline has been breached') &&
            new Date(notif.createdAt) >= startOfToday
        );

        if (hasTodayNotification) {
          continue;
        }

        // Calculate how overdue it is
        const overdueHours = Math.floor(
          (now.getTime() - new Date(complaint.slaDeadline!).getTime()) / (1000 * 60 * 60)
        );

        await NotificationService.createNotification({
          userId: officerId,
          type: 'ALERT',
          title: '🚨 SLA Deadline Breached!',
          message: `Complaint "${complaint.title}" (${complaint.complaintId}) SLA deadline has been breached by ${overdueHours} hours. This requires immediate attention!`,
          complaintId: complaint._id.toString(),
          metadata: {
            slaDeadline: complaint.slaDeadline,
            overdueHours,
            category: complaint.category,
          },
        });
      }
    } catch (error) {
      console.error('Error notifying breached SLAs:', error);
    }
  }
}
