import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Complaint from '@/models/Complaint';
import AuditLog from '@/models/AuditLog';
import { NotificationService } from '@/services/notification.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    if (userRole !== 'OFFICER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const { id } = await params;
    
    // Check if id is a complaint ID (CMP-YYYY-XXXXXX) or MongoDB ObjectId
    const isComplaintId = id.startsWith('CMP-');
    const complaint = isComplaintId
      ? await Complaint.findOne({ complaintId: id })
          .populate('createdBy', 'name email phone')
          .populate('assignedTo', 'name email department')
          .populate({
            path: 'officerComments',
            populate: {
              path: 'addedBy',
              select: 'name'
            }
          })
          .lean()
      : await Complaint.findById(id)
          .populate('createdBy', 'name email phone')
          .populate('assignedTo', 'name email department')
          .populate({
            path: 'officerComments',
            populate: {
              path: 'addedBy',
              select: 'name'
            }
          })
          .lean();

    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    // Officers can only view complaints assigned to them
    if (complaint.assignedTo?._id.toString() !== userId) {
      return NextResponse.json({ error: 'Forbidden - Not assigned to you' }, { status: 403 });
    }

    return NextResponse.json(complaint);
  } catch (error) {
    console.error('Error fetching complaint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Accept complaint (change status to IN_PROGRESS)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;
    const userName = session.user.name || '';

    if (userRole !== 'OFFICER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const { id } = await params;
    const { action, comment, resolutionProof, resolutionNotes } = await request.json();

    // Check if id is a complaint ID (CMP-YYYY-XXXXXX) or MongoDB ObjectId
    const isComplaintId = id.startsWith('CMP-');
    const complaint = isComplaintId
      ? await Complaint.findOne({ complaintId: id })
      : await Complaint.findById(id);

    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    if (complaint.assignedTo?.toString() !== userId) {
      return NextResponse.json({ error: 'Forbidden - Not assigned to you' }, { status: 403 });
    }

    // Handle different actions
    if (action === 'accept') {
      if (complaint.status !== 'ASSIGNED') {
        return NextResponse.json(
          { error: 'Can only accept complaints with ASSIGNED status' },
          { status: 400 }
        );
      }

      complaint.status = 'IN_PROGRESS';
      complaint.statusHistory.push({
        status: 'IN_PROGRESS',
        changedBy: userId,
        changedAt: new Date(),
        notes: 'Complaint accepted by officer',
      });

      await complaint.save();

      // Create audit log
      await AuditLog.create({
        action: 'STATUS_CHANGE',
        entity: 'Complaint',
        entityId: complaint._id,
        userId,
        userName,
        userRole,
        changes: { status: 'IN_PROGRESS' },
        metadata: { complaintId: complaint.complaintId },
      });

      // Notify citizen
      await NotificationService.createNotification({
        userId: complaint.createdBy.toString(),
        type: 'INFO',
        title: 'Complaint In Progress',
        message: `Your complaint ${complaint.complaintId} is now being worked on`,
        complaintId: complaint.complaintId,
      });

      // Notify admins
      await NotificationService.notifyAllAdmins(
        'Complaint Accepted',
        `Officer has accepted complaint ${complaint.complaintId}`,
        'INFO',
        complaint.complaintId
      );

      return NextResponse.json({ message: 'Complaint accepted', complaint });
    }

    if (action === 'addComment') {
      if (!comment) {
        return NextResponse.json({ error: 'Comment is required' }, { status: 400 });
      }

      complaint.officerComments = complaint.officerComments || [];
      complaint.officerComments.push({
        comment,
        addedBy: userId,
        addedAt: new Date(),
      });

      await complaint.save();

      // Create audit log
      await AuditLog.create({
        action: 'UPDATE',
        entity: 'Complaint',
        entityId: complaint._id,
        userId,
        userName,
        userRole,
        changes: { action: 'comment_added' },
        metadata: { complaintId: complaint.complaintId, comment },
      });

      // Notify citizen about new comment
      await NotificationService.createNotification({
        userId: complaint.createdBy.toString(),
        type: 'INFO',
        title: 'New Update',
        message: `Update added to your complaint ${complaint.complaintId}`,
        complaintId: complaint.complaintId,
      });

      return NextResponse.json({ message: 'Comment added', complaint });
    }

    if (action === 'resolve') {
      if (complaint.status !== 'IN_PROGRESS') {
        return NextResponse.json(
          { error: 'Can only resolve complaints with IN_PROGRESS status' },
          { status: 400 }
        );
      }

      if (!resolutionProof || resolutionProof.length === 0) {
        return NextResponse.json(
          { error: 'Resolution proof is required' },
          { status: 400 }
        );
      }

      complaint.status = 'RESOLVED';
      complaint.resolutionProof = resolutionProof;
      complaint.resolutionNotes = resolutionNotes;
      complaint.resolvedAt = new Date();
      complaint.isSlaMet = complaint.resolvedAt <= complaint.slaDeadline;

      complaint.statusHistory.push({
        status: 'RESOLVED',
        changedBy: userId,
        changedAt: new Date(),
        notes: resolutionNotes || 'Complaint resolved',
      });

      await complaint.save();

      // Create audit log
      await AuditLog.create({
        action: 'STATUS_CHANGE',
        entity: 'Complaint',
        entityId: complaint._id,
        userId,
        userName,
        userRole,
        changes: { status: 'RESOLVED' },
        metadata: {
          complaintId: complaint.complaintId,
          isSlaMet: complaint.isSlaMet,
        },
      });

      // Notify citizen about resolution
      await NotificationService.createNotification({
        userId: complaint.createdBy.toString(),
        type: 'INFO',
        title: 'Complaint Resolved',
        message: `Your complaint ${complaint.complaintId} has been resolved`,
        complaintId: complaint.complaintId,
      });

      // Notify admins
      await NotificationService.notifyAllAdmins(
        'Complaint Resolved',
        `Complaint ${complaint.complaintId} has been resolved - SLA ${complaint.isSlaMet ? 'met' : 'breached'}`,
        complaint.isSlaMet ? 'INFO' : 'ALERT',
        complaint.complaintId
      );

      return NextResponse.json({ message: 'Complaint resolved', complaint });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating complaint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
