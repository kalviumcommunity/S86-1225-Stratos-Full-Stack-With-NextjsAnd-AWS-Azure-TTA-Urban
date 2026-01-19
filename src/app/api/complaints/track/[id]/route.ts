import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Complaint from '@/models/Complaint';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;

    const complaint = await Complaint.findOne({ complaintId: id })
      .select('complaintId title status category location createdAt updatedAt')
      .lean();

    if (!complaint) {
      return NextResponse.json(
        { error: 'Complaint not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      complaintId: complaint.complaintId,
      title: complaint.title,
      status: complaint.status,
      category: complaint.category,
      location: complaint.location,
      submittedAt: complaint.createdAt,
      lastUpdate: complaint.updatedAt
    });
  } catch (error) {
    console.error('Error tracking complaint:', error);
    return NextResponse.json(
      { error: 'Failed to fetch complaint details' },
      { status: 500 }
    );
  }
}
