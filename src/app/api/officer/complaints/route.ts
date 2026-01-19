import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Complaint from '@/models/Complaint';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    // Only officers can access this endpoint
    if (userRole !== 'OFFICER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    // Get all complaints assigned to this officer with full details
    const complaints = await Complaint.find({ assignedTo: userId })
      .populate('createdBy', 'name email')
      .select('complaintId title category location status createdAt assignedAt slaDeadline resolvedAt createdBy')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      complaints,
    });
  } catch (error) {
    console.error('Error fetching officer complaints:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
