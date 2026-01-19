import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Complaint from '@/models/Complaint';
import { USER_ROLES } from '@/utils/constants';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = session.user as any;
    
    // Build query based on user role
    let query: any = {};
    if (user.role === USER_ROLES.CITIZEN) {
      // Citizens only see their own complaints
      query.createdBy = user.id;
    } else if (user.role === USER_ROLES.OFFICER) {
      // Officers see complaints assigned to them
      query.assignedTo = user.id;
    }
    // Admins see all complaints (empty query)

    // Get total complaints
    const total = await Complaint.countDocuments(query);

    // Get resolved complaints
    const resolved = await Complaint.countDocuments({
      ...query,
      status: { $in: ['RESOLVED', 'CLOSED'] }
    });

    // Get pending complaints (not resolved or closed)
    const pending = await Complaint.countDocuments({
      ...query,
      status: { $nin: ['RESOLVED', 'CLOSED'] }
    });

    // Calculate average resolution time
    const resolvedComplaints = await Complaint.find({
      ...query,
      status: { $in: ['RESOLVED', 'CLOSED'] },
      resolvedAt: { $exists: true }
    }).select('createdAt resolvedAt');

    let avgResolutionTime = 0;
    if (resolvedComplaints.length > 0) {
      const totalResolutionTime = resolvedComplaints.reduce((sum, complaint) => {
        const resolutionTime = new Date(complaint.resolvedAt).getTime() - new Date(complaint.createdAt).getTime();
        return sum + resolutionTime;
      }, 0);
      
      // Convert to days
      avgResolutionTime = Math.round(totalResolutionTime / resolvedComplaints.length / (1000 * 60 * 60 * 24));
    }

    return NextResponse.json({
      success: true,
      stats: {
        total,
        resolved,
        pending,
        avgResolutionTime
      }
    });
  } catch (error: any) {
    console.error('Error fetching complaint stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
