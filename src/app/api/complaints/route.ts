import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ComplaintService } from '@/services/complaint.service';
import { AuditService } from '@/services/audit.service';
import { NotificationService } from '@/services/notification.service';
import { AUDIT_ACTIONS, NOTIFICATION_TYPES } from '@/utils/constants';
import { createComplaintSchema } from '@/utils/validators';

// GET: Get all complaints (with filters)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    const { searchParams } = new URL(request.url);

    const filters: any = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    };

    // Role-based filtering
    if (user.role === 'CITIZEN') {
      filters.createdBy = user.id;
    } else if (user.role === 'OFFICER') {
      filters.assignedTo = user.id;
    }

    // Additional filters
    if (searchParams.get('status')) filters.status = searchParams.get('status');
    if (searchParams.get('category')) filters.category = searchParams.get('category');

    const result = await ComplaintService.getComplaints(filters);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching complaints:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Create new complaint
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    
    // Parse FormData
    const formData = await request.formData();
    
    const complaintData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      location: {
        address: formData.get('address') as string || '',
        lat: parseFloat(formData.get('latitude') as string || '0'),
        lng: parseFloat(formData.get('longitude') as string || '0'),
      },
    };

    // Validate required fields
    if (!complaintData.title || !complaintData.description || !complaintData.category) {
      return NextResponse.json(
        { error: 'Title, description, and category are required' },
        { status: 400 }
      );
    }

    // Handle image uploads (if any)
    const images = formData.getAll('images') as File[];
    const imageUrls: string[] = [];

    // Convert images to base64 for MVP (store in database)
    // For production, consider using Cloudinary or similar service
    if (images.length > 0) {
      console.log(`Processing ${images.length} images`);
      
      for (const image of images) {
        try {
          const bytes = await image.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const base64 = buffer.toString('base64');
          const mimeType = image.type || 'image/jpeg';
          const dataUrl = `data:${mimeType};base64,${base64}`;
          imageUrls.push(dataUrl);
        } catch (error) {
          console.error('Error processing image:', error);
        }
      }
      
      console.log(`Successfully processed ${imageUrls.length} images`);
    }

    // Create complaint
    const complaint = await ComplaintService.createComplaint({
      ...complaintData,
      images: imageUrls,
      createdBy: user.id,
    });

    // Create audit log
    await AuditService.createLog({
      action: AUDIT_ACTIONS.CREATE,
      entity: 'Complaint',
      entityId: complaint._id.toString(),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      metadata: { complaintId: complaint.complaintId, category: complaint.category },
    });

    // Create notification for user
    await NotificationService.createNotification({
      userId: user.id,
      type: NOTIFICATION_TYPES.COMPLAINT_CREATED,
      title: 'Complaint Created',
      message: `Your complaint ${complaint.complaintId} has been submitted successfully.`,
      complaintId: complaint.complaintId,
    });

    // Notify all admins about new complaint
    await NotificationService.notifyAllAdmins(
      'New Complaint Submitted',
      `New complaint ${complaint.complaintId} has been submitted - ${complaint.title}`,
      'ACTION',
      complaint.complaintId
    );

    return NextResponse.json(
      { message: 'Complaint created successfully', complaint },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating complaint:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
