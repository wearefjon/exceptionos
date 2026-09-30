import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const workOrders = db.getWorkOrders();
    return NextResponse.json({ success: true, workOrders });
  } catch (error) {
    console.error('Error fetching work orders:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch work orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { workOrderId, action, technicianName } = body;

    if (!workOrderId || action !== 'complete') {
      return NextResponse.json({ success: false, error: 'Invalid parameters' }, { status: 400 });
    }

    const updated = db.completeWorkOrder(workOrderId, technicianName || 'James Okoro');
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Work order not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      workOrder: updated,
      message: 'Work order completed. Incident transitioned to AWAITING_VERIFICATION.',
    });
  } catch (error) {
    console.error('Error updating work order:', error);
    return NextResponse.json({ success: false, error: 'Failed to update work order' }, { status: 500 });
  }
}
