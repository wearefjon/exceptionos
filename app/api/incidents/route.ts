import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const severity = searchParams.get('severity') || undefined;
    const incidents = db.getIncidents({ status, severity });
    return NextResponse.json({ success: true, incidents });
  } catch (error) {
    console.error('Error fetching incidents:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch incidents' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, assetIdentifier, reporterName, severity } = body;

    if (!title || !assetIdentifier) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const incident = db.createIncident({
      title,
      description: description || title,
      assetIdentifier,
      reporterName: reporterName || 'Voice Operator',
      severity,
      autoInvestigate: true,
    });

    return NextResponse.json({ success: true, incident });
  } catch (error) {
    console.error('Error creating incident:', error);
    return NextResponse.json({ success: false, error: 'Failed to create incident' }, { status: 500 });
  }
}
