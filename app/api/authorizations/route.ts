import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const authorizations = db.getAuthorizations();
    return NextResponse.json({ success: true, authorizations });
  } catch (error) {
    console.error('Error fetching authorizations:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch authorizations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { authId, action, approverName, reason } = body;

    if (!authId || !action) {
      return NextResponse.json({ success: false, error: 'Missing authId or action' }, { status: 400 });
    }

    if (action === 'approve') {
      const result = db.approveAuthorization(authId, approverName || 'Sarah Williams (Supervisor)');
      if (!result) return NextResponse.json({ success: false, error: 'Authorization not found' }, { status: 404 });
      return NextResponse.json({ success: true, authorization: result, message: 'Authorization approved and work order issued' });
    } else if (action === 'reject') {
      const result = db.rejectAuthorization(authId, approverName || 'Sarah Williams (Supervisor)', reason);
      if (!result) return NextResponse.json({ success: false, error: 'Authorization not found' }, { status: 404 });
      return NextResponse.json({ success: true, authorization: result, message: 'Authorization rejected and incident escalated' });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error processing authorization:', error);
    return NextResponse.json({ success: false, error: 'Failed to process authorization' }, { status: 500 });
  }
}
