import { NextRequest, NextResponse } from 'next/server';
import { ComplaintService } from '@/services/complaint.service';

// GET: Get public statistics
export async function GET(request: NextRequest) {
  try {
    const stats = await ComplaintService.getPublicStats();
    return NextResponse.json({ stats });
  } catch (error: any) {
    console.error('Error fetching public stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
