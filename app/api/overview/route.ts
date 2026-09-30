import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const metrics = db.getOverviewMetrics();
    const recentIncidents = db.getIncidents().slice(0, 6);
    const recentActivity = db.getAuditLogs().slice(0, 5);
    const sites = db.getSites();

    return NextResponse.json({
      success: true,
      metrics,
      recentIncidents,
      recentActivity,
      sites,
    });
  } catch (error) {
    console.error('Error fetching overview data:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch overview data' }, { status: 500 });
  }
}
