import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Complaint from '@/models/Complaint';
import User from '@/models/User';
import AuditLog from '@/models/AuditLog';
import { NotificationService } from '@/services/notification.service';
import { DEFAULT_SLA } from '@/utils/constants';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const slaBreached = searchParams.get('slaBreached');
    const search = searchParams.get('search');

    let query: any = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (slaBreached === 'true') {
      query.slaDeadline = { $lt: new Date() };
      query.status = { $nin: ['RESOLVED', 'CLOSED'] };
    }

    if (search) {
      query.complaintId = { $regex: search, $options: 'i' };
    }

    const complaints = await Complaint.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name department')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ complaints });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { complaintId, officerId } = await request.json();

    if (!complaintId || !officerId) {
      return NextResponse.json(
        { error: 'Complaint ID and Officer ID are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    const officer = await User.findById(officerId);
    if (!officer || officer.role !== 'OFFICER') {
      return NextResponse.json({ error: 'Invalid officer' }, { status: 400 });
    }

    // Update complaint
    complaint.assignedTo = officerId;
    complaint.assignedAt = new Date();
    complaint.status = 'ASSIGNED';

    complaint.statusHistory.push({
      status: 'ASSIGNED',
      changedBy: (session.user as any).id,
      changedAt: new Date(),
      notes: `Assigned to ${officer.name}`,
    });

    await complaint.save();

    // Create audit log
    await AuditLog.create({
      action: 'ASSIGN',
      entity: 'Complaint',
      entityId: complaint._id,
      userId: (session.user as any).id,
      userName: session.user.name || '',
      userRole: 'ADMIN',
      changes: { assignedTo: officer.name },
      metadata: {
        complaintId: complaint.complaintId,
        officerId: officer._id.toString(),
        officerName: officer.name,
      },
    });

    // Notify officer about assignment with SLA deadline
    const slaDeadline = complaint.slaDeadline 
      ? new Date(complaint.slaDeadline).toLocaleString('en-IN', { 
          dateStyle: 'medium', 
          timeStyle: 'short',
          timeZone: 'Asia/Kolkata'
        })
      : 'Not set';
    
    await NotificationService.createNotification({
      userId: officer._id.toString(),
      type: 'ACTION',
      title: 'New Complaint Assigned',
      message: `Complaint ${complaint.complaintId} "${complaint.title}" has been assigned to you. SLA Deadline: ${slaDeadline}`,
      complaintId: complaint.complaintId,
    });

    // Notify citizen about assignment
    await NotificationService.createNotification({
      userId: complaint.createdBy.toString(),
      type: 'INFO',
      title: 'Complaint Assigned',
      message: `Your complaint ${complaint.complaintId} has been assigned to an officer`,
      complaintId: complaint.complaintId,
    });

    return NextResponse.json({
      message: 'Complaint assigned successfully',
      complaint,
    });
  } catch (error) {
    console.error('Error assigning complaint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
