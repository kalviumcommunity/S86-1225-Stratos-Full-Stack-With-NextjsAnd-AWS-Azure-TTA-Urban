import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import AuditLog from '@/models/AuditLog';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    let query: any = { isActive: true };

    if (role && role !== 'all') {
      query.role = role;
    }

    const users = await User.find(query)
      .select('name email role department isActive createdAt')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { userId, isActive } = body;

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent modifying admin users
    if (user.role === 'ADMIN') {
      return NextResponse.json({ error: 'Cannot modify admin users' }, { status: 403 });
    }

    const changes: any = {};
    // Roles cannot be changed - they are fixed at registration
    if (isActive !== undefined && isActive !== user.isActive) {
      changes.isActive = { from: user.isActive, to: isActive };
      user.isActive = isActive;
    }

    await user.save();

    // Create audit log
    await AuditLog.create({
      action: 'UPDATE',
      entity: 'User',
      entityId: user._id,
      userId: (session.user as any).id,
      userName: session.user.name,
      userRole: (session.user as any).role,
      changes,
      metadata: {
        description: `User ${user.name} updated by admin`,
      },
    });

    return NextResponse.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
