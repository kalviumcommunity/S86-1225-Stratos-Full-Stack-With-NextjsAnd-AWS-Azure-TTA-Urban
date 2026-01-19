import Notification, { INotification } from '@/models/Notification';
import { NotificationType } from '@/utils/constants';
import connectDB from '@/lib/db';
import User from '@/models/User';

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  complaintId?: string;
  metadata?: Record<string, any>;
}

export class NotificationService {
  /**
   * Create a new notification
   */
  static async createNotification(params: CreateNotificationParams): Promise<INotification> {
    await connectDB();

    const notification = await Notification.create(params);
    return notification;
  }

  /**
   * Create notifications for multiple users
   */
  static async createBulkNotifications(
    userIds: string[],
    params: Omit<CreateNotificationParams, 'userId'>
  ): Promise<INotification[]> {
    await connectDB();

    const notifications = await Notification.insertMany(
      userIds.map((userId) => ({
        userId,
        ...params,
      }))
    );

    return notifications;
  }

  /**
   * Get user notifications
   */
  static async getUserNotifications(
    userId: string,
    options: { unreadOnly?: boolean; limit?: number } = {}
  ): Promise<INotification[]> {
    await connectDB();

    const { unreadOnly = false, limit = 50 } = options;

    const query: any = { userId };
    if (unreadOnly) {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return notifications as INotification[];
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string): Promise<void> {
    await connectDB();

    await Notification.findByIdAndUpdate(notificationId, { isRead: true });
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<void> {
    await connectDB();

    await Notification.updateMany({ userId, isRead: false }, { isRead: true });
  }

  /**
   * Get unread count
   */
  static async getUnreadCount(userId: string): Promise<number> {
    await connectDB();

    const count = await Notification.countDocuments({ userId, isRead: false });
    return count;
  }

  /**
   * Delete notification
   */
  static async deleteNotification(notificationId: string): Promise<void> {
    await connectDB();

    await Notification.findByIdAndDelete(notificationId);
  }

  /**
   * Notify all admins
   */
  static async notifyAllAdmins(
    title: string,
    message: string,
    type: 'INFO' | 'ACTION' | 'ALERT' = 'INFO',
    complaintId?: string
  ): Promise<void> {
    await connectDB();

    const admins = await User.find({ role: 'ADMIN' }).select('_id');
    const adminIds = admins.map((admin) => admin._id.toString());

    if (adminIds.length > 0) {
      await Notification.insertMany(
        adminIds.map((userId) => ({
          userId,
          title,
          message,
          type,
          complaintId,
          isRead: false,
        }))
      );
    }
  }
}
