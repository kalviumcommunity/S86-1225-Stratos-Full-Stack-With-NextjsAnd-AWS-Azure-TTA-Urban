import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Complaint from '@/models/Complaint';
import User from '@/models/User';
import Feedback from '@/models/Feedback';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;

    // Only admins can access this endpoint
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    // Get all complaints
    const allComplaints = await Complaint.find().lean();

    // Calculate KPIs
    const totalComplaints = allComplaints.length;
    const resolved = allComplaints.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
    const resolvedPercentage = totalComplaints > 0 ? Math.round((resolved / totalComplaints) * 100) : 0;

    // Calculate average resolution time
    const resolvedComplaints = allComplaints.filter(
      (c) => (c.status === 'RESOLVED' || c.status === 'CLOSED') && c.resolvedAt && c.createdAt
    );
    const avgResolutionTime =
      resolvedComplaints.length > 0
        ? Math.round(
            resolvedComplaints.reduce((sum, c) => {
              const time = new Date(c.resolvedAt!).getTime() - new Date(c.createdAt).getTime();
              return sum + time;
            }, 0) /
              resolvedComplaints.length /
              (1000 * 60 * 60)
          ) // Convert to hours
        : 0;

    const slaBreached = allComplaints.filter(
      (c) =>
        c.slaDeadline &&
        new Date(c.slaDeadline) < new Date() &&
        c.status !== 'RESOLVED' &&
        c.status !== 'CLOSED'
    ).length;

    // Complaints by category
    const categoryStats: Record<string, number> = {};
    allComplaints.forEach((c) => {
      categoryStats[c.category] = (categoryStats[c.category] || 0) + 1;
    });

    // Complaints by status
    const statusStats: Record<string, number> = {};
    allComplaints.forEach((c) => {
      statusStats[c.status] = (statusStats[c.status] || 0) + 1;
    });

    // Daily submissions (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      date.setHours(0, 0, 0, 0);
      return date;
    });

    const dailyStats = last7Days.map((date) => {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const count = allComplaints.filter((c) => {
        const created = new Date(c.createdAt);
        return created >= date && created < nextDay;
      }).length;

      return {
        date: date.toISOString().split('T')[0],
        count,
      };
    });

    // Officer performance
    const officers = await User.find({ role: 'OFFICER', isActive: true }).lean();

    const officerPerformance = await Promise.all(
      officers.map(async (officer) => {
        const officerComplaints = allComplaints.filter(
          (c) => c.assignedTo?.toString() === officer._id.toString()
        );

        const assigned = officerComplaints.length;
        const resolvedByOfficer = officerComplaints.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED').length;

        const resolvedWithTimes = officerComplaints.filter(
          (c) => (c.status === 'RESOLVED' || c.status === 'CLOSED') && c.resolvedAt && c.assignedAt
        );

        const avgTime =
          resolvedWithTimes.length > 0
            ? Math.round(
                resolvedWithTimes.reduce((sum, c) => {
                  const time = new Date(c.resolvedAt!).getTime() - new Date(c.assignedAt!).getTime();
                  return sum + time;
                }, 0) /
                  resolvedWithTimes.length /
                  (1000 * 60 * 60)
              )
            : 0;

        const breaches = officerComplaints.filter(
          (c) =>
            c.slaDeadline &&
            new Date(c.slaDeadline) < new Date() &&
            c.status !== 'RESOLVED' &&
            c.status !== 'CLOSED'
        ).length;

        return {
          _id: officer._id,
          name: officer.name,
          department: officer.department || 'N/A',
          assigned,
          resolved: resolvedByOfficer,
          avgResolutionTime: avgTime,
          slaBreaches: breaches,
        };
      })
    );

    // Get feedback statistics
    const allFeedbacks = await Feedback.find();
    const feedbackStats = {
      totalFeedbacks: allFeedbacks.length,
      averageRating: allFeedbacks.length > 0 
        ? parseFloat((allFeedbacks.reduce((sum, f) => sum + f.rating, 0) / allFeedbacks.length).toFixed(2))
        : 0,
      lowRatings: allFeedbacks.filter(f => f.rating <= 2).length,
      highRatings: allFeedbacks.filter(f => f.rating >= 4).length,
    };

    return NextResponse.json({
      kpis: {
        totalComplaints,
        resolvedPercentage,
        avgResolutionTime,
        slaBreached,
      },
      charts: {
        byCategory: categoryStats,
        byStatus: statusStats,
        daily: dailyStats,
      },
      officerPerformance,
      feedbackStats,
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
