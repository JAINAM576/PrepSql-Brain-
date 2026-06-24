import { NextRequest, NextResponse } from 'next/server';
import { getClientId } from '@/lib/app-state';
import { syncSessionToBackend } from '@/lib/backend-sync';

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8000';

export async function POST(request: NextRequest) {
  try {
    const clientId = await getClientId();

    // 1. Sync session connection and settings to Python backend
    await syncSessionToBackend(clientId);

    const body = await request.json();

    // 2. Call Python FastAPI backend to execute analysis
    const res = await fetch(`${BACKEND_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-prepsql-session-id': clientId,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: errData.detail || 'Python backend analysis failed' },
        { status: res.status }
      );
    }

    const response = await res.json();
    return NextResponse.json(response);
  } catch (error) {
    console.error('AI analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}
