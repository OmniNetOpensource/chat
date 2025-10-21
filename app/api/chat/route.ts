import { google } from '@ai-sdk/google';
import { convertToModelMessages, streamText, type UIMessage } from 'ai';
import { NextRequest } from 'next/server';

import type { MessageBlock } from '@/app/lib/types';

const DEFAULT_MODEL = 'gemini-2.5-flash';
const SSE_HEADERS: Record<string, string> = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache, no-transform',
  Connection: 'keep-alive',
};

type IncomingMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string | MessageBlock[];
  id?: string;
};

function extractMediaType(dataUrl: string | undefined): string | undefined {
  if (!dataUrl) {
    return undefined;
  }

  const match = /^data:([^;,]+)[;,]/.exec(dataUrl);
  return match?.[1];
}

function toUiMessageParts(contents: MessageBlock[]): UIMessage['parts'] {
  const parts: UIMessage['parts'] = [];

  for (const content of contents) {
    if (!content || typeof content !== 'object') {
      continue;
    }

    switch (content.type) {
      case 'text': {
        const text =
          typeof content.text === 'string' && content.text.length > 0 ? content.text : undefined;
        if (text) {
          parts.push({ type: 'text', text } as UIMessage['parts'][number]);
        }
        break;
      }

      case 'websearch': {
        const text =
          typeof content.content === 'string' && content.content.length > 0
            ? content.content
            : undefined;
        if (text) {
          parts.push({ type: 'text', text } as UIMessage['parts'][number]);
        }
        break;
      }

      case 'image': {
        if (typeof content.base64 === 'string' && content.base64.length > 0) {
          const mediaType = extractMediaType(content.base64) ?? 'application/octet-stream';
          parts.push({
            type: 'file',
            url: content.base64,
            mediaType,
          } as UIMessage['parts'][number]);
        }
        break;
      }

      case 'file': {
        if (typeof content.base64 === 'string' && content.base64.length > 0) {
          const mediaType = extractMediaType(content.base64) ?? 'application/octet-stream';
          parts.push({
            type: 'file',
            url: content.base64,
            mediaType,
          } as UIMessage['parts'][number]);
        }
        break;
      }

      case 'thinking':
        // This block represents intermediate reasoning; skip sending back to the model.
        break;

      default: {
        // Ignore unsupported block types when forwarding to the model.
        break;
      }
    }
  }

  return parts;
}

function mapIncomingMessages(rawMessages: IncomingMessage[]): {
  systemPrompt?: string;
  uiMessages: UIMessage[];
} {
  const uiMessages: UIMessage[] = [];
  let systemPrompt: string | undefined;

  for (const raw of rawMessages) {
    if (!raw) {
      continue;
    }

    const { role, content, id } = raw;

    if (role === 'system') {
      if (typeof content === 'string') {
        systemPrompt = content;
      } else if (Array.isArray(content)) {
        const aggregated = content
          .map((part) => {
            switch (part.type) {
              case 'text':
              case 'thinking':
                return typeof part.text === 'string' ? part.text : '';
              case 'websearch':
                return typeof part.content === 'string' ? part.content : '';
              default:
                return '';
            }
          })
          .filter(Boolean)
          .join('\n');

        if (aggregated) {
          systemPrompt = aggregated;
        }
      }
      continue;
    }

    if (role !== 'user' && role !== 'assistant') {
      continue;
    }

    const parts =
      typeof content === 'string'
        ? ([{ type: 'text', text: content }] as UIMessage['parts'])
        : Array.isArray(content)
          ? toUiMessageParts(content)
          : [];

    if (parts.length === 0) {
      continue;
    }

    uiMessages.push({
      id: typeof id === 'string' && id.length > 0 ? id : crypto.randomUUID(),
      role,
      parts,
    } satisfies UIMessage);
  }

  return { systemPrompt, uiMessages };
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    console.error('Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable.');
    return new Response(JSON.stringify({ error: 'Missing Google API key' }), { status: 500 });
  }

  let payload: {
    messages?: IncomingMessage[];
    model?: string;
  };

  try {
    payload = await req.json();
  } catch (error) {
    console.error('Failed to parse request body:', error);
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 });
  }

  const { messages, model } = payload ?? {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: 'Missing messages in request body' }), {
      status: 400,
    });
  }

  const { systemPrompt, uiMessages } = mapIncomingMessages(messages);

  if (uiMessages.length === 0) {
    return new Response(JSON.stringify({ error: 'No valid messages to process' }), { status: 400 });
  }

  const requestedModel =
    typeof model === 'string' && model.trim().length > 0 ? model.trim() : DEFAULT_MODEL;
  const modelId = requestedModel.startsWith('google/')
    ? requestedModel.slice('google/'.length)
    : requestedModel;

  let result: ReturnType<typeof streamText>;

  try {
    result = streamText({
      model: google(modelId),
      system: systemPrompt,
      messages: convertToModelMessages(uiMessages),
      abortSignal: req.signal,
    });
  } catch (error) {
    console.error('Failed to initialize streamText call:', error);
    return new Response(JSON.stringify({ error: 'Failed to contact Google Generative AI' }), {
      status: 500,
    });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch (error) {
          console.error('Failed to enqueue SSE chunk:', error);
        }
      };

      let doneSent = false;
      const sendDone = () => {
        if (!doneSent) {
          doneSent = true;
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        }
      };

      try {
        for await (const part of result.fullStream) {
          if (
            part.type === 'reasoning-delta' &&
            typeof part.text === 'string' &&
            part.text.length > 0
          ) {
            send({
              choices: [
                {
                  delta: {
                    reasoning: part.text,
                  },
                },
              ],
            });
            continue;
          }

          if (part.type === 'text-delta' && typeof part.text === 'string' && part.text.length > 0) {
            send({
              choices: [
                {
                  delta: {
                    content: part.text,
                  },
                },
              ],
            });
          }
        }
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          console.warn('Stream aborted by client.');
        } else {
          console.error('Error while streaming response:', error);
        }
      } finally {
        sendDone();
        controller.close();
      }
    },
    cancel() {
      // The AbortSignal from Next.js will handle downstream cancellation.
    },
  });

  return new Response(stream, {
    status: 200,
    headers: SSE_HEADERS,
  });
}
