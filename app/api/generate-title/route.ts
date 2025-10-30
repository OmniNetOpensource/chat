import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import type { NextRequest } from 'next/server';

const MODEL_NAME = 'gemini-2.5-flash-lite';

function buildPrompt(userMessage: string, assistantMessage: string): string {
  return `Based on this conversation, generate a very short title (10-15 characters) in the same language as the user's message. Only return the title text, nothing else.

User: ${userMessage}
Assistant: ${assistantMessage}`;
}

function sanitizeTitle(raw: string): string {
  const normalized = raw.replace(/^[\"'“”‘’]+|[\"'“”‘’]+$/g, '').trim();
  return normalized.split('\n')[0]?.trim() ?? '';
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    console.error('Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable.');
    return new Response('Missing Google API key', { status: 500 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch (error) {
    console.error('Failed to parse title generation request body:', error);
    return new Response('Invalid JSON body', { status: 400 });
  }

  const { userMessage, assistantMessage } = (payload ?? {}) as {
    userMessage?: unknown;
    assistantMessage?: unknown;
  };

  if (
    typeof userMessage !== 'string' ||
    typeof assistantMessage !== 'string' ||
    userMessage.trim().length === 0 ||
    assistantMessage.trim().length === 0
  ) {
    return new Response('Invalid request body', { status: 400 });
  }

  try {
    const { text } = await generateText({
      model: google(MODEL_NAME),
      prompt: buildPrompt(userMessage, assistantMessage),
    });

    const title = sanitizeTitle(text ?? '');
    if (!title) {
      return new Response('Failed to generate title', { status: 500 });
    }

    return new Response(title, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    console.error('Failed to generate conversation title:', error);
    return new Response('Failed to generate title', { status: 500 });
  }
}
