import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    db.resetToSeed();
    const metrics = db.getOverviewMetrics();
    const incidents = db.getIncidents();
    return NextResponse.json({
      success: true,
      message: 'Demo state reset to initial Machine 7 scenario',
      metrics,
      machine7IncidentId: 'INC-10482',
      incidentsCount: incidents.length,
    });
  } catch (error) {
    console.error('Failed to reset demo state:', error);
    return NextResponse.json({ success: false, error: 'Failed to reset demo state' }, { status: 500 });
  }
}
