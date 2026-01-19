import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Feedback from '@/models/Feedback';
import User from '@/models/User';

// GET /api/admin/feedback - Get all feedback with full analytics (Admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Admins only.' },
        { status: 403 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const officerId = searchParams.get('officerId');
    const minRating = searchParams.get('minRating');
    const maxRating = searchParams.get('maxRating');

    console.log('Fetching feedback - page:', page, 'limit:', limit);

    // Build query
    const query: any = {};
    if (officerId) query.officerId = officerId;
    if (minRating) query.rating = { ...query.rating, $gte: parseInt(minRating) };
    if (maxRating) query.rating = { ...query.rating, $lte: parseInt(maxRating) };

    // Get total count
    const total = await Feedback.countDocuments(query);
    console.log('Total feedback count:', total);

    // Get paginated feedback with populated data
    const feedbacks = await Feedback.find(query)
      .populate('citizenId', 'name email')
      .populate('officerId', 'name email department')
      .populate('complaintId', 'complaintId title category')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Get overall statistics
    const allFeedbacks = await Feedback.find();
    
    const overallStats = {
      totalFeedbacks: allFeedbacks.length,
      averageRating: allFeedbacks.length > 0 
        ? parseFloat((allFeedbacks.reduce((sum, f) => sum + f.rating, 0) / allFeedbacks.length).toFixed(2))
        : 0,
      ratingDistribution: allFeedbacks.reduce((dist, f) => {
        dist[f.rating] = (dist[f.rating] || 0) + 1;
        return dist;
      }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>)
    };

    // Get low rating alerts (rating < 2)
    const lowRatingAlerts = await Feedback.find({ rating: { $lte: 2 } })
      .populate('citizenId', 'name')
      .populate('officerId', 'name department')
      .populate('complaintId', 'complaintId title')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get officer-wise statistics
    const officerStats = await Feedback.aggregate([
      {
        $group: {
          _id: '$officerId',
          totalFeedbacks: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          lowestRating: { $min: '$rating' },
          highestRating: { $max: '$rating' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'officer'
        }
      },
      {
        $unwind: '$officer'
      },
      {
        $project: {
          officerId: '$_id',
          officerName: '$officer.name',
          department: '$officer.department',
          totalFeedbacks: 1,
          averageRating: { $round: ['$averageRating', 2] },
          lowestRating: 1,
          highestRating: 1
        }
      },
      {
        $sort: { averageRating: -1 }
      }
    ]);

    return NextResponse.json({
      feedbacks: feedbacks.map(f => ({
        id: f._id,
        complaintId: f.complaintId ? {
          _id: f.complaintId._id,
          complaintId: f.complaintId.complaintId,
          title: f.complaintId.title,
          category: f.complaintId.category
        } : null,
        citizen: f.citizenId ? {
          id: f.citizenId._id,
          name: f.citizenId.name,
          email: f.citizenId.email
        } : null,
        officer: f.officerId ? {
          id: f.officerId._id,
          name: f.officerId.name,
          email: f.officerId.email,
          department: f.officerId.department
        } : null,
        rating: f.rating,
        comment: f.comment,
        createdAt: f.createdAt
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      overallStats,
      lowRatingAlerts: lowRatingAlerts.map(f => ({
        id: f._id,
        complaintId: f.complaintId?.complaintId,
        complaintTitle: f.complaintId?.title,
        citizenName: f.citizenId?.name,
        officerName: f.officerId?.name,
        department: f.officerId?.department,
        rating: f.rating,
        comment: f.comment,
        createdAt: f.createdAt
      })),
      officerStats
    });

  } catch (error) {
    console.error('Error fetching admin feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}
