import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ComplaintService } from '@/services/complaint.service';
import { AuditService } from '@/services/audit.service';
import { NotificationService } from '@/services/notification.service';
import { AUDIT_ACTIONS, NOTIFICATION_TYPES, USER_ROLES } from '@/utils/constants';

// GET: Get complaint by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    // Check if id is a complaint ID (CMP-YYYY-XXXXXX) or MongoDB ObjectId
    const isComplaintId = id.startsWith('CMP-');
    const complaint = isComplaintId 
      ? await ComplaintService.getComplaintByComplaintId(id)
      : await ComplaintService.getComplaintById(id);

    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    return NextResponse.json({ complaint });
  } catch (error: any) {
    console.error('Error fetching complaint:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Update complaint (status, assign, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const user = session.user as any;
    const body = await request.json();
    const { action, ...data } = body;

    let updatedComplaint;

    if (action === 'assign') {
      // Only admin can assign
      if (user.role !== USER_ROLES.ADMIN) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      updatedComplaint = await ComplaintService.assignComplaint(
        id,
        data.officerId,
        user.id,
        data.notes
      );

      // Notify officer
      await NotificationService.createNotification({
        userId: data.officerId,
        type: NOTIFICATION_TYPES.COMPLAINT_ASSIGNED,
        title: 'New Complaint Assigned',
        message: `You have been assigned complaint ${updatedComplaint?.complaintId}`,
        complaintId: updatedComplaint?.complaintId,
      });

      // Audit log
      await AuditService.createLog({
        action: AUDIT_ACTIONS.ASSIGN,
        entity: 'Complaint',
        entityId: id,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        changes: { assignedTo: data.officerId },
      });
    } else if (action === 'updateStatus') {
      updatedComplaint = await ComplaintService.updateStatus({
        complaintId: id,
        status: data.status,
        changedBy: user.id,
        notes: data.notes,
        resolutionProof: data.resolutionProof,
        resolutionNotes: data.resolutionNotes,
      });

      // Notify complaint creator
      if (updatedComplaint) {
        await NotificationService.createNotification({
          userId: (updatedComplaint.createdBy as any)._id || updatedComplaint.createdBy,
          type: NOTIFICATION_TYPES.STATUS_UPDATED,
          title: 'Complaint Status Updated',
          message: `Your complaint ${updatedComplaint.complaintId} status has been updated to ${data.status}`,
          complaintId: updatedComplaint.complaintId,
        });
      }

      // Audit log
      await AuditService.createLog({
        action: AUDIT_ACTIONS.STATUS_CHANGE,
        entity: 'Complaint',
        entityId: params.id,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        changes: { status: data.status },
      });
    }

    return NextResponse.json({ complaint: updatedComplaint });
  } catch (error: any) {
    console.error('Error updating complaint:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
