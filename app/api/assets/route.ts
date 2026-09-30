import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (id) {
      const asset = db.getAsset(id);
      if (!asset) return NextResponse.json({ success: false, error: 'Asset not found' }, { status: 404 });
      return NextResponse.json({ success: true, asset });
    }
    const assets = db.getAssets();
    return NextResponse.json({ success: true, assets });
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch assets' }, { status: 500 });
  }
}
