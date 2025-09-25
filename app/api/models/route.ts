// app/api/models/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'edge'; // 可选：走 Edge，更快

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  console.log('OPENROUTER_API_KEY:', apiKey ? 'Exists' : 'Missing');
  if (!apiKey) {
    console.error('Missing OPENROUTER_API_KEY');
    return NextResponse.json({ error: 'Missing OPENROUTER_API_KEY' }, { status: 500 });
  }

  // 你也可以换成 /models/user，根据用户 provider 偏好过滤
  const url = `${OPENROUTER_BASE}/models`;

  const res = await fetch(url, {
    method: 'GET',
    // 注意：服务端发起请求，不会在浏览器暴露 key
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.APP_URL || '',
      'X-Title': process.env.APP_TITLE || 'Next.js App',
    },
    // 你可以按需选择缓存策略
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
