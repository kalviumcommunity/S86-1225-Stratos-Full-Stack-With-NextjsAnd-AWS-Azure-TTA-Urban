import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SLAWarningService } from '@/services/sla-warning.service';

/**
 * Manual trigger for SLA warning check
 * Only accessible by admins for testing purposes
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;

    // Only admins can manually trigger
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    console.log('Manual SLA warning check triggered by admin:', session.user.name);
    
    await SLAWarningService.checkAndNotifySLAWarnings();

    return NextResponse.json({ 
      success: true, 
      message: 'SLA warning check completed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in manual SLA check:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check SLA warnings',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}
