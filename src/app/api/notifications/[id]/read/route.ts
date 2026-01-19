import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Notification from '@/models/Notification';

// PATCH /api/notifications/[id]/read - Mark notification as read
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const notification = await Notification.findOneAndUpdate(
      {
        _id: params.id,
        userId: (session.user as any).id, // Security: only update own notifications
      },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, notification });
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notification as read', details: error.message },
      { status: 500 }
    );
  }
}
