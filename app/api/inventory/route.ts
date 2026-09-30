import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const inventory = db.getInventory();
    return NextResponse.json({ success: true, inventory });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch inventory' }, { status: 500 });
  }
}
