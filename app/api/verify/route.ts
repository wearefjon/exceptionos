import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { incidentId } = body;

    if (!incidentId) {
      return NextResponse.json({ success: false, error: 'Missing incidentId' }, { status: 400 });
    }

    const verified = db.verifyAndResolveIncident(incidentId);
    if (!verified) {
      return NextResponse.json({ success: false, error: 'Incident not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      incident: verified,
      message:
        verified.status === 'RESOLVED'
          ? 'Outcome verified: temperature and vibration within normal operating thresholds. Incident RESOLVED.'
          : 'Verification failed: telemetry exceeds threshold. Incident ESCALATED.',
    });
  } catch (error) {
    console.error('Error verifying incident outcome:', error);
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 });
  }
}
