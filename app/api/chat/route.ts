import { google } from '@ai-sdk/google';
import { convertToModelMessages, streamText, type JSONValue, type UIMessage } from 'ai';
import { NextRequest } from 'next/server';

import type { MessageBlock } from '@/lib/types';

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
    enableSearch?: boolean;
    thinking?:
      | boolean
      | {
          includeThoughts?: boolean;
          budget?: number;
        };
  };

  try {
    payload = await req.json();
  } catch (error) {
    console.error('Failed to parse request body:', error);
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 });
  }

  const { messages, model, enableSearch, thinking } = payload ?? {};

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

  const useSearchTools = enableSearch === true;
  const tools = useSearchTools
    ? ({
        google_search: google.tools.googleSearch({}),
        url_context: google.tools.urlContext({}),
      } as Record<string, unknown>)
    : undefined;

  let providerOptions: Record<string, Record<string, JSONValue>> | undefined;
  if (thinking !== false) {
    const thinkingOptions = thinking && typeof thinking === 'object' ? thinking : undefined;

    const includeThoughts =
      (typeof thinkingOptions?.includeThoughts === 'boolean'
        ? thinkingOptions.includeThoughts
        : undefined) ?? true;
    const budget =
      typeof thinkingOptions?.budget === 'number' && thinkingOptions.budget > 0
        ? thinkingOptions.budget
        : undefined;
    providerOptions = {
      google: {
        thinkingConfig: {
          ...(budget !== undefined ? { thinkingBudget: budget } : {}),
          includeThoughts,
        },
      },
    } satisfies Record<string, Record<string, JSONValue>>;
  }

  let result: ReturnType<typeof streamText>;

  try {
    result = streamText({
      model: google(modelId),
      system: systemPrompt,
      messages: convertToModelMessages(uiMessages),
      ...(tools ? { tools: tools as any } : {}), // eslint-disable-line @typescript-eslint/no-explicit-any
      ...(providerOptions ? { providerOptions } : {}),
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
          send(part);
        }
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          console.warn('Stream aborted by client.');
        } else {
          console.error('Error while streaming response:', error);
          // 提取错误信息
          let errorMessage = 'An error occurred while streaming';

          // 尝试从 AI SDK 错误中提取结构化信息
          if (error && typeof error === 'object') {
            const err = error as any; // eslint-disable-line @typescript-eslint/no-explicit-any

            // 检查 responseBody 中的错误信息
            if (err.responseBody) {
              try {
                const parsed = JSON.parse(err.responseBody);
                if (parsed.error?.message) {
                  errorMessage = parsed.error.message;
                }
              } catch {
                // 解析失败，使用默认消息
              }
            }

            // 或者从 lastError 中提取
            if (!errorMessage && err.lastError?.responseBody) {
              try {
                const parsed = JSON.parse(err.lastError.responseBody);
                if (parsed.error?.message) {
                  errorMessage = parsed.error.message;
                }
              } catch {
                // 解析失败
              }
            }

            // 最后尝试 message 属性
            if (errorMessage === 'An error occurred while streaming' && err.message) {
              errorMessage = err.message;
            }
          }

          // 发送错误事件给前端
          send({
            type: 'error',
            error: errorMessage,
          });
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
