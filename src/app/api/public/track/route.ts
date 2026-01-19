import { NextRequest, NextResponse } from 'next/server';
import { ComplaintService } from '@/services/complaint.service';

// GET: Track complaint by complaint ID (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const complaintId = searchParams.get('id');

    if (!complaintId) {
      return NextResponse.json({ error: 'Complaint ID is required' }, { status: 400 });
    }

    const complaint = await ComplaintService.getComplaintByComplaintId(complaintId);

    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    // Return limited information for public tracking
    return NextResponse.json({
      complaint: {
        complaintId: complaint.complaintId,
        title: complaint.title,
        category: complaint.category,
        status: complaint.status,
        createdAt: complaint.createdAt,
        statusHistory: complaint.statusHistory,
        location: complaint.location,
      },
    });
  } catch (error: any) {
    console.error('Error tracking complaint:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
