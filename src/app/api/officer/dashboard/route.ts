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

    // Get only necessary fields for stats calculation - much faster
    const complaints = await Complaint.find({ assignedTo: userId })
      .select('status slaDeadline resolvedAt createdAt')
      .lean();

    // Calculate stats
    const totalAssigned = complaints.length;
    const inProgress = complaints.filter((c) => c.status === 'IN_PROGRESS').length;
    const resolved = complaints.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
    
    // SLA Breached: includes both open complaints past deadline AND resolved/closed complaints that were resolved after deadline
    const slaBreached = complaints.filter((c) => {
      if (!c.slaDeadline) return false;
      
      const slaDeadline = new Date(c.slaDeadline);
      
      // For resolved/closed complaints, check if they were resolved after the deadline
      if (c.status === 'RESOLVED' || c.status === 'CLOSED') {
        if (c.resolvedAt) {
          return new Date(c.resolvedAt) > slaDeadline;
        }
        return false;
      }
      
      // For open complaints, check if deadline has passed
      return slaDeadline < new Date();
    }).length;

    return NextResponse.json({
      stats: {
        totalAssigned,
        inProgress,
        resolved,
        slaBreached,
      },
    });
  } catch (error) {
    console.error('Error fetching officer dashboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
