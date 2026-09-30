import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'ASSEMBLYAI_API_KEY is not configured' }, { status: 500 });

  const response = await fetch('https://agents.assemblyai.com/v1/token?expires_in_seconds=300', {
    method: 'GET',
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: 'no-store',
  });

  if (!response.ok) {
    const detail = await response.text();
    return NextResponse.json({ error: 'AssemblyAI token request failed', detail }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json({ token: data.token ?? data });
}
