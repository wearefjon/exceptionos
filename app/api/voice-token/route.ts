import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ available: false, message: 'Native Web Speech fallback active' });
  }

  try {
    const response = await fetch('https://api.assemblyai.com/v2/realtime/token', {
      method: 'POST',
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ expires_in: 3600 }),
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json({ available: false, error: 'AssemblyAI token request failed' });
    }

    const data = await response.json();
    return NextResponse.json({ available: true, token: data.token });
  } catch {
    return NextResponse.json({ available: false, error: 'Network error contacting AssemblyAI' });
  }
}
