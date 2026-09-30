import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    return NextResponse.json({
      available: false,
      message: 'ASSEMBLYAI_API_KEY not configured. Browser speech fallback active.',
    });
  }

  try {
    const res = await fetch('https://agents.assemblyai.com/v1/token?expires_in_seconds=300', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`AssemblyAI token endpoint returned status ${res.status}: ${errText}`);
      return NextResponse.json({
        available: false,
        error: `AssemblyAI token request failed with status ${res.status}`,
        details: errText,
      });
    }

    const data = await res.json().catch(async () => {
      const text = await res.text();
      return { token: text };
    });

    const token = data.token || data;

    return NextResponse.json({
      available: true,
      token,
      expires_in_seconds: 300,
      wsUrl: `wss://agents.assemblyai.com/v1/ws?token=${token}`,
    });
  } catch (error: any) {
    console.error('Error requesting AssemblyAI Voice Agent token:', error);
    return NextResponse.json({
      available: false,
      error: error.message || 'Network error requesting AssemblyAI token',
    });
  }
}
