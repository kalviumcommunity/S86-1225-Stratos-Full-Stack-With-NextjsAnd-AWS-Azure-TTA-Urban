import { NextRequest, NextResponse } from 'next/server';
import { SLAWarningService } from '@/services/sla-warning.service';

/**
 * API endpoint to check and send SLA warnings
 * This should be called periodically by a cron job (e.g., every 30 minutes)
 * 
 * Example cron setup:
 * - Use services like Vercel Cron, cron-job.org, or EasyCron
 * - Schedule: Every 30 minutes
 * - URL: https://your-domain.com/api/cron/sla-check
 * - Optional: Add Authorization header with secret key for security
 */
export async function GET(request: NextRequest) {
  try {
    // Optional: Add security check
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key-here';
    
    // Uncomment to enable auth protection
    // if (authHeader !== `Bearer ${cronSecret}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    console.log('Running SLA warning check...');
    
    await SLAWarningService.checkAndNotifySLAWarnings();

    return NextResponse.json({ 
      success: true, 
      message: 'SLA warnings checked and notifications sent',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in SLA check cron job:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check SLA warnings',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

// Allow POST as well for flexibility
export async function POST(request: NextRequest) {
  return GET(request);
}
