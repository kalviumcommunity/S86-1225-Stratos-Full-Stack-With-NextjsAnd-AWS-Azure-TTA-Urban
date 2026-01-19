import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Complaint from '@/models/Complaint';
import Feedback from '@/models/Feedback';
import { COMPLAINT_STATUS } from '@/utils/constants';
import mongoose from 'mongoose';

// POST /api/complaints/[id]/feedback - Submit feedback (Citizen only)
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { rating, comment } = await req.json();

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Validate comment length if provided
    if (comment && comment.length > 300) {
      return NextResponse.json(
        { error: 'Comment cannot exceed 300 characters' },
        { status: 400 }
      );
    }

    await connectDB();

    const params = await context.params;
    const complaintId = params.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(complaintId)) {
      return NextResponse.json(
        { error: 'Invalid complaint ID' },
        { status: 400 }
      );
    }

    // Fetch complaint
    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      return NextResponse.json(
        { error: 'Complaint not found' },
        { status: 404 }
      );
    }

    // ✅ RULE 1: Only complaint owner can submit feedback
    if (complaint.createdBy.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the complaint owner can submit feedback' },
        { status: 403 }
      );
    }

    // ✅ RULE 2: Feedback only allowed when status = RESOLVED
    if (complaint.status !== COMPLAINT_STATUS.RESOLVED) {
      return NextResponse.json(
        { error: 'Feedback can only be submitted for resolved complaints' },
        { status: 400 }
      );
    }

    // ✅ RULE 3: Check if feedback already exists (one per complaint)
    const existingFeedback = await Feedback.findOne({ complaintId });

    if (existingFeedback) {
      return NextResponse.json(
        { error: 'Feedback already submitted for this complaint' },
        { status: 400 }
      );
    }

    // Ensure complaint has an assigned officer
    if (!complaint.assignedTo) {
      return NextResponse.json(
        { error: 'Cannot submit feedback for unassigned complaint' },
        { status: 400 }
      );
    }

    // Create feedback
    const feedback = await Feedback.create({
      complaintId,
      citizenId: session.user.id,
      officerId: complaint.assignedTo,
      rating,
      comment: comment?.trim() || undefined
    });

    // Update complaint status to CLOSED after feedback
    complaint.status = COMPLAINT_STATUS.CLOSED;
    await complaint.save();

    return NextResponse.json({
      success: true,
      message: 'Thank you for your feedback',
      feedback: {
        id: feedback._id,
        rating: feedback.rating,
        createdAt: feedback.createdAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

// GET /api/complaints/[id]/feedback - Get feedback for a complaint
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const params = await context.params;
    const complaintId = params.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(complaintId)) {
      return NextResponse.json(
        { error: 'Invalid complaint ID' },
        { status: 400 }
      );
    }

    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      return NextResponse.json(
        { error: 'Complaint not found' },
        { status: 404 }
      );
    }

    const feedback = await Feedback.findOne({ complaintId });

    if (!feedback) {
      return NextResponse.json({
        exists: false,
        feedback: null
      });
    }

    // Different views based on role
    const userRole = session.user.role;
    const userId = session.user.id;

    if (userRole === 'ADMIN') {
      // ✅ Admin sees everything
      return NextResponse.json({
        exists: true,
        feedback: {
          id: feedback._id,
          rating: feedback.rating,
          comment: feedback.comment,
          citizenId: feedback.citizenId,
          officerId: feedback.officerId,
          createdAt: feedback.createdAt
        }
      });
    } else if (userRole === 'CITIZEN' && complaint.createdBy.toString() === userId) {
      // ✅ Citizen sees their own feedback
      return NextResponse.json({
        exists: true,
        feedback: {
          id: feedback._id,
          rating: feedback.rating,
          comment: feedback.comment,
          createdAt: feedback.createdAt
        }
      });
    } else if (userRole === 'OFFICER') {
      // ✅ Officer sees only rating (no comment, no citizen identity)
      return NextResponse.json({
        exists: true,
        feedback: {
          rating: feedback.rating,
          createdAt: feedback.createdAt
        }
      });
    }

    return NextResponse.json(
      { error: 'Access denied' },
      { status: 403 }
    );

  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}
