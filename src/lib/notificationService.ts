import dbConnect from '@/lib/dbConnect';
import Notification from '@/models/Notification';
import User from '@/models/User';
import mongoose from 'mongoose';

interface CreateNotificationParams {
  userId: string | mongoose.Types.ObjectId;
  title: string;
  message: string;
  type?: 'INFO' | 'ACTION' | 'ALERT';
  complaintId?: string;
  metadata?: Record<string, any>;
}

/**
 * Create a notification for a user
 * @param params - Notification parameters
 * @returns Created notification
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    await dbConnect();

    const notification = await Notification.create({
      userId: params.userId,
      title: params.title,
      message: params.message,
      type: params.type || 'INFO',
      complaintId: params.complaintId,
      metadata: params.metadata,
      isRead: false,
    });

    // TODO: Optional - Send email notification
    // await sendEmailNotification(params.userId, params.title, params.message);

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

/**
 * Create notifications for multiple users
 * @param userIds - Array of user IDs
 * @param title - Notification title
 * @param message - Notification message
 * @param type - Notification type
 * @param complaintId - Related complaint ID
 */
export async function createBulkNotifications(
  userIds: (string | mongoose.Types.ObjectId)[],
  title: string,
  message: string,
  type: 'INFO' | 'ACTION' | 'ALERT' = 'INFO',
  complaintId?: string
) {
  try {
    await dbConnect();

    const notifications = userIds.map((userId) => ({
      userId,
      title,
      message,
      type,
      complaintId,
      isRead: false,
    }));

    await Notification.insertMany(notifications);
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    throw error;
  }
}

/**
 * Get all admins and send them a notification
 * @param title - Notification title
 * @param message - Notification message
 * @param type - Notification type
 * @param complaintId - Related complaint ID
 */
export async function notifyAllAdmins(
  title: string,
  message: string,
  type: 'INFO' | 'ACTION' | 'ALERT' = 'INFO',
  complaintId?: string
) {
  try {
    await dbConnect();

    const admins = await User.find({ role: 'ADMIN' }).select('_id');
    const adminIds = admins.map((admin) => admin._id);

    if (adminIds.length > 0) {
      await createBulkNotifications(adminIds, title, message, type, complaintId);
    }
  } catch (error) {
    console.error('Error notifying admins:', error);
    throw error;
  }
}

/**
 * Mark a notification as read
 * @param notificationId - Notification ID
 * @param userId - User ID (for security check)
 */
export async function markNotificationAsRead(
  notificationId: string,
  userId: string
) {
  try {
    await dbConnect();

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true }
    );

    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

/**
 * Mark all notifications as read for a user
 * @param userId - User ID
 */
export async function markAllAsRead(userId: string) {
  try {
    await dbConnect();

    await Notification.updateMany({ userId, isRead: false }, { isRead: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}

/**
 * Get unread count for a user
 * @param userId - User ID
 * @returns Unread count
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    await dbConnect();

    const count = await Notification.countDocuments({ userId, isRead: false });
    return count;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}

// TODO: Email notification function (optional for MVP)
// async function sendEmailNotification(userId: string, title: string, message: string) {
//   try {
//     const user = await User.findById(userId);
//     if (!user || !user.email) return;
//
//     // Using Nodemailer or Resend
//     // await sendEmail({
//     //   to: user.email,
//     //   subject: title,
//     //   text: message,
//     // });
//   } catch (error) {
//     console.error('Error sending email notification:', error);
//   }
// }
