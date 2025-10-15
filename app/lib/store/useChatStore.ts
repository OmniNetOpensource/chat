'use client';

import { create } from 'zustand';
import { saveConversation, getConversation } from '../services/indexedDBService';

type ChatErrorKind = 'network' | 'database' | 'parsing';

class ChatStoreError extends Error {
  constructor(
    readonly kind: ChatErrorKind,
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = `${kind[0].toUpperCase()}${kind.slice(1)}Error`;
  }
}

export class NetworkError extends ChatStoreError {
  constructor(message = 'Network request failed', cause?: unknown) {
    super('network', message, cause);
  }
}

export class DatabaseError extends ChatStoreError {
  constructor(message: 'Failed to access local data store', cause?: unknown) {
    super('database', message, cause);
  }
}

export class ParsingError extends ChatStoreError {
  constructor(message: 'Unable to parse server response', cause?: unknown) {
    super('parsing', message, cause);
  }
}

const isRetryable = (error: unknown): boolean => {
  if (error instanceof ChatStoreError) {
    return error.kind !== 'parsing';
  }
  if (error instanceof Error && error.name === 'AbortError') {
    return false;
  }
  return true;
};

interface RetryOptions {
  retries?: number;
  baseDelayMs?: number;
}

export const withExponentialBackoff = async <T>(
  job: () => Promise<T>,
  { retries = 3, baseDelayMs = 250 }: RetryOptions = {},
): Promise<T> => {
  let attempt = 0;

  while (true) {
    try {
      return await job();
    } catch (error) {
      attempt += 1;
      if (attempt > retries || !isRetryable(error)) {
        throw error;
      }

      const jitter = Math.random() * baseDelayMs;
      const delay = baseDelayMs * 2 ** (attempt - 1) + jitter;

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

export const toUserErrorMessage = (error: unknown): string => {
  if (error instanceof ChatStoreError) {
    switch (error.kind) {
      case 'network':
        return '网络连接出现问题，请检查后再试。';
      case 'database':
        return '本地会话缓存暂时不可用，稍后重试。';
      case 'parsing':
        return '收到的响应格式不对，已通知服务端，请稍后再试。';
    }
  }

  if (error instanceof Error) {
    return error.message || '出现未知错误，请稍后再试。';
  }

  return '出现未知错误，请稍后再试。';
};

interface TextContent {
  type: 'text';
  text: string;
}

interface ImageContent {
  type: 'image_url';
  image_url: {
    url: string;
  };
}

interface ThinkingContent {
  type: 'thinking';
  text: string;
  id: string;
  time: number;
}

export type Content = TextContent | ThinkingContent | ImageContent;

export interface Message {
  role: 'user' | 'system' | 'assistant';
  content: Content[];
}

interface UseChatStoreProps {
  messages: Message[];
  sendMessage: (index: number, content: Content[]) => void; // Return conversationId for new conversations
  stop: () => void;
  regenerate: (index: number) => void;
  controller: AbortController | undefined;
  status: 'ready' | 'streaming';
  clear: () => void;

  currentThinkingId: string;

  editing: number;
  error: string | null;

  currentConversationId: string | null;
  setCurrentConversationId: (id: string) => void;
  loadConversation: (id: string) => Promise<string | null>; // Return conversationId

  model: string;
  setModel: (modelName: string) => void;
  systemPrompt: string;
  setSystemPrompt: (prompt: string) => void;
}

export const useChatStore = create<UseChatStoreProps>((set, get) => ({
  messages: [],
  sendMessage: async (index, content) => {
    const controller = new AbortController();

    set((state) => ({
      messages: [...state.messages.slice(0, index), { role: 'user', content: content }],
      status: 'streaming',
      controller: controller,
    }));

    const messagesToSend = get().messages.map((msg) => {
      return {
        role: msg.role,
        content: msg.content.filter((c) => c.type !== 'thinking'),
      };
    });

    const title =
      get()
        .messages[0].content.filter((m) => m.type === 'text')
        .map((m) => m.text)
        .join('')
        .slice(0, 10) || 'title';

    await saveConversation({
      id: get().currentConversationId as string,
      title,
      messages: get().messages,
      updatedAt: Date.now(),
      model: get().model,
      systemPrompt: get().systemPrompt,
    });

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: get().model,
          messages: [{ role: 'system', content: get().systemPrompt }, ...messagesToSend],
          stream: true,
          reasoning: {
            effort: 'high',
          },
          //preset: '',
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        set(() => ({
          error: `Failed to send message: ${response.status} ${response.statusText}. ${errorText}`,
        }));
        return null;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const decoder = new TextDecoder();

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        while (true) {
          const lineEnd = buffer.indexOf('\n');
          if (lineEnd === -1) break;

          const line = buffer.slice(0, lineEnd).trim();
          buffer = buffer.slice(lineEnd + 1);

          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);

              const thinking = parsed.choices[0].delta.reasoning || '';
              const answering = parsed.choices[0].delta.content || '';

              set((state) => {
                const messages = [...state.messages];

                if (messages.length === 0 || messages[messages.length - 1].role !== 'assistant') {
                  messages.push({
                    role: 'assistant',
                    content: [],
                  });
                }

                const latestMessage = messages[messages.length - 1].content;
                const latestContent = latestMessage[latestMessage.length - 1] || {};

                let newThinkingId = state.currentThinkingId;

                if (thinking) {
                  const isLastThinking = latestContent && latestContent.type === 'thinking';

                  if (isLastThinking) {
                    latestContent.text += thinking;
                  } else {
                    const newId = crypto.randomUUID();
                    latestMessage.push({
                      id: newId,
                      type: 'thinking',
                      text: thinking,
                      time: Date.now(),
                    });
                    newThinkingId = newId;
                  }
                }

                if (answering) {
                  const isLastContent = latestContent && latestContent.type === 'text';

                  if (isLastContent) {
                    latestContent.text += answering;
                  } else {
                    if (latestContent && latestContent.type === 'thinking') {
                      latestContent.time = parseFloat(
                        ((Date.now() - latestContent.time) / 1000).toFixed(0),
                      );
                    }
                    latestMessage.push({
                      type: 'text',
                      text: answering,
                    });
                    newThinkingId = '';
                  }
                }

                return { messages, currentThinkingId: newThinkingId };
              });
            } catch (e) {
              console.error('Error parsing stream data:', e);
            }
          }
        }
      }
    } catch (error) {
      if (!(error instanceof Error && error.name === 'AbortError')) {
        console.error('Request error:', error);
      }
    } finally {
      set(() => ({ status: 'ready', controller: undefined }));
      const existing = await getConversation(get().currentConversationId as string);
      if (existing) {
        await saveConversation({
          ...existing,
          messages: get().messages,
          updatedAt: Date.now(),
          model: get().model,
          systemPrompt: get().systemPrompt,
        });
      }
    }
  },

  stop: () => {
    get().controller?.abort();
  },

  regenerate: (index: number) => {
    const newMessages = get().messages[index - 1];
    get().sendMessage(index - 1, newMessages.content);
    console.log(`Regenerating message at index: ${index}`);
  },

  controller: undefined,
  status: 'ready' as const,
  clear: () => {
    set(() => ({
      messages: [],
      status: 'ready',
      controller: undefined,
      currentConversationId: null,
      currentThinkingId: '',
    }));
  },
  currentMessage: [],
  currentThinkingId: '',

  editing: -1,

  currentConversationId: null,
  loadConversation: async (id) => {
    if (!id) {
      return null;
    }
    const currentConversation = await getConversation(id);
    if (!currentConversation) {
      return null;
    }
    set(() => ({
      messages: currentConversation.messages,
      currentConversationId: currentConversation.id,
      model: currentConversation.model || 'anthropic/claude-4.5-sonnet',
      systemPrompt:
        currentConversation.systemPrompt ||
        `请用朴实、平静、耐心的语言回答我的问题，就像一个有经验的朋友在认真地帮我理解一个话题。语气要温和、鼓励，让人感到你愿意花时间把事情讲清楚。不要使用夸张的形容词和营销式的表达，比如"非常棒"、"超级强大"这类词，而是具体说明实际情况就好。

回答时请关注底层原理和运作机制，不只是停留在表面现象。重点说明"为什么"和"怎么做到的"，而不只是"是什么"。涉及具体机制时，说明内部是如何运作的、各个环节如何衔接、过程中发生了什么变化。

在解释复杂概念时，请从最基础的部分讲起，一步步引导到深层内容。如果某个概念需要先理解一些背景知识或相关话题，可以稍微展开解释一下，确保理解的连贯性。把整个话题拆分成容易消化的小步骤，让人能跟上思路。

请主动预见可能产生歧义或困惑的地方，在讲到这些点时停下来做个说明。比如某个术语有多种含义，或者某个步骤容易被误解，就提前澄清。用具体例子和场景来说明抽象概念，指出新手常见的误区和容易忽略的细节。可以适当使用类比，但要确保类比准确，不要为了简化而丢失关键信息。

默认使用完整句子与成段表述；少使用要点式列表。`,
    }));
    return currentConversation.id;
  },
  error: null,
  model: 'x-ai/grok-4-fast:free',
  setModel: (modelName) => {
    set(() => ({ model: modelName }));
  },
  systemPrompt: '',
  setSystemPrompt: (prompt) => {
    set(() => ({ systemPrompt: prompt }));
  },
  setCurrentConversationId: (id) => {
    set(() => ({ currentConversationId: id }));
  },
}));
