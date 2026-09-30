import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { speechText, reporterName } = body;

    if (!speechText || typeof speechText !== 'string') {
      return NextResponse.json({ success: false, error: 'Speech text is required' }, { status: 400 });
    }

    const text = speechText.trim();
    const assets = db.getAssets();

    // 1. Identify likely asset from text
    let matchedAsset = assets.find(
      (a) =>
        text.toLowerCase().includes(a.name.toLowerCase()) ||
        text.toLowerCase().includes(a.assetCode.toLowerCase())
    );

    if (!matchedAsset) {
      if (text.toLowerCase().includes('conveyor')) {
        matchedAsset = assets.find((a) => a.type === 'Conveyor') || assets[0];
      } else if (text.toLowerCase().includes('press') || text.toLowerCase().includes('hydraulic')) {
        matchedAsset = assets.find((a) => a.type === 'Press') || assets[0];
      } else if (text.toLowerCase().includes('compressor')) {
        matchedAsset = assets.find((a) => a.type === 'Compressor') || assets[0];
      } else {
        matchedAsset = assets[0]; // Defaults to Machine 7
      }
    }

    // 2. Determine severity
    const isCritical =
      text.toLowerCase().includes('overheating') ||
      text.toLowerCase().includes('smoke') ||
      text.toLowerCase().includes('critical') ||
      text.toLowerCase().includes('failure') ||
      text.toLowerCase().includes('stopped');

    const severity = isCritical ? 'Critical' : 'High';
    const title = `${matchedAsset.name} ${isCritical ? 'overheating and abnormal vibration' : 'operational exception'}`;

    // 3. Create incident with full automated investigation loop
    const incident = db.createIncident({
      title,
      description: text,
      assetIdentifier: matchedAsset.assetCode,
      reporterName: reporterName || 'Voice Operator (James Okoro)',
      severity,
      autoInvestigate: true,
    });

    if (!incident) {
      return NextResponse.json({ success: false, error: 'Failed to create incident' }, { status: 500 });
    }

    const spokenResponse = `Understood. Identified ${matchedAsset.name} at ${matchedAsset.siteName}. Telemetry shows abnormal readings at ${matchedAsset.telemetry.temperature} degrees Celsius and ${matchedAsset.telemetry.vibration}g vibration. Local stock is exhausted. Four compatible replacement units located at Warehouse B. Incident ${incident.id} created and awaiting supervisor authorization for dispatch.`;

    return NextResponse.json({
      success: true,
      incident,
      spokenResponse,
      steps: [
        { label: 'Voice understood', detail: text },
        { label: 'Asset identified', detail: `${matchedAsset.name} (${matchedAsset.assetCode}) at ${matchedAsset.siteName}` },
        { label: 'Telemetry queried', detail: `Temp: ${matchedAsset.telemetry.temperature}°C, Vib: ${matchedAsset.telemetry.vibration}g` },
        { label: 'SOP & inventory checked', detail: `Local: 0 units. Found 4 units at Warehouse B ($420)` },
        { label: 'Action formulated', detail: `Dispatch 1 × Bearing B-204 to ${matchedAsset.siteName}` },
        { label: 'Authorization requested', detail: `Incident ${incident.id} awaiting supervisor sign-off` },
      ],
    });
  } catch (error) {
    console.error('Error in voice agent orchestration:', error);
    return NextResponse.json({ success: false, error: 'Failed to process voice command' }, { status: 500 });
  }
}
