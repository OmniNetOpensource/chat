import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

export const runtime = 'edge';

const myOpenAI = createOpenAI({
  apiKey: process.env.API_KEY!,
  baseURL: 'https://openai-proxy-service-491339614967.us-central1.run.app/v1',
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: myOpenAI('google/gemini-2.5-pro'),
    messages,
  });

  return result.toDataStreamResponse();
}
