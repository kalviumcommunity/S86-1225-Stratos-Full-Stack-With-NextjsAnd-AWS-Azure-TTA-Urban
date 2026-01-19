import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Feedback from '@/models/Feedback';

// GET /api/officer/feedback - Get officer's own feedback statistics
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'OFFICER') {
      return NextResponse.json(
        { error: 'Access denied. Officers only.' },
        { status: 403 }
      );
    }

    await connectDB();

    const officerId = session.user.id;

    // Get all feedback for this officer
    const feedbacks = await Feedback.find({ officerId });

    if (feedbacks.length === 0) {
      return NextResponse.json({
        totalFeedbacks: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      });
    }

    // Calculate statistics
    const totalRating = feedbacks.reduce((sum, f) => sum + f.rating, 0);
    const averageRating = totalRating / feedbacks.length;

    // Rating distribution
    const ratingDistribution = feedbacks.reduce((dist, f) => {
      dist[f.rating] = (dist[f.rating] || 0) + 1;
      return dist;
    }, {} as Record<number, number>);

    // Ensure all ratings 1-5 are present
    for (let i = 1; i <= 5; i++) {
      if (!ratingDistribution[i]) ratingDistribution[i] = 0;
    }

    return NextResponse.json({
      totalFeedbacks: feedbacks.length,
      averageRating: parseFloat(averageRating.toFixed(2)),
      ratingDistribution,
      // Officer does NOT see individual comments or citizen names
    });

  } catch (error) {
    console.error('Error fetching officer feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}
