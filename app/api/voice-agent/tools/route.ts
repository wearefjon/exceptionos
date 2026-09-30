import { NextResponse } from 'next/server';
import { executeOperationalTool, EXCEPTIONOS_TOOLS } from '@/lib/operational-tools';

export async function GET() {
  return NextResponse.json({
    success: true,
    tools: EXCEPTIONOS_TOOLS,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { toolName, args } = body;

    if (!toolName) {
      return NextResponse.json({ success: false, error: 'toolName is required' }, { status: 400 });
    }

    const result = await executeOperationalTool(toolName, args || {});
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error executing operational tool:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Tool execution failed' },
      { status: 500 }
    );
  }
}
