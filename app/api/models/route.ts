import { NextResponse } from 'next/server';

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  console.log('OPENROUTER_API_KEY:', apiKey ? 'Exists' : 'Missing');
  if (!apiKey) {
    console.error('Missing OPENROUTER_API_KEY');
    return NextResponse.json({ error: 'Missing OPENROUTER_API_KEY' }, { status: 500 });
  }

  const url = `${OPENROUTER_BASE}/models`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.APP_URL || '',
      'X-Title': process.env.APP_TITLE || 'Next.js App',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('OpenRouter API error:', text);
    return NextResponse.json({ error: text || 'OpenRouter error' }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
