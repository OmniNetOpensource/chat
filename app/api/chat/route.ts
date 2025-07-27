import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

export const runtime = 'edge';

const myOpenAI = createOpenAI({
  apiKey: process.env.API_KEY!,
  baseURL: 'https://openai-proxy-service-491339614967.us-central1.run.app/v1',
});

export async function POST(req: Request) {
  const { messages } = await req.json();
  const signal = req.signal;
  
  try {
    const result = await streamText({
      model: myOpenAI('google/gemini-2.5-pro'),
      messages,
    });
    
    const { readable, writable } = new TransformStream();
    const dataStream = result.toDataStreamResponse({
      experimental_sendFinish: false,
      experimental_sendStart: false,
      sendSources: false,
      sendUsage: false,
    });
    
    if (signal) {
      signal.addEventListener('abort', () => {
        writable.abort(new Error('客户端取消了请求'));
      });
    }
    
    dataStream.body?.pipeTo(writable).catch(() => {});
    
    return new Response(readable);
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      return new Response('请求已取消', { status: 499 });
    }
    return new Response('处理请求时出错', { status: 500 });
  }
}
