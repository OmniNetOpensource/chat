import { NextResponse } from 'next/server';

const GOOGLE_MODELS = [
  'google/gemini-2.5-flash',
  'google/gemini-2.5-pro',
  'google/gemini-2.5-flash-lite',
  'google/gemini-2.5-flash-lite-preview-06-17',
  'google/gemini-2.0-flash',
  'google/gemini-1.5-pro',
  'google/gemini-1.5-flash',
  'google/gemini-1.5-flash-8b',
];

export async function GET() {
  return NextResponse.json({
    data: GOOGLE_MODELS.map((id) => ({ id })),
    provider: 'google',
  });
}
