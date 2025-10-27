'use client';

import { create } from 'zustand';
import { saveConversation, getConversation } from '../services/indexedDBService';
import { type MessageType, type UserMessage, type WebsearchBlock } from '../types';

export {
  DatabaseError,
  NetworkError,
  ParsingError,
  isRetryable,
  toUserErrorMessage,
  withExponentialBackoff,
} from '../errors';

interface UseChatStoreProps {
  messages: MessageType[];
  sendMessage: (index: number, message: UserMessage) => void;
  stop: () => void;
  regenerate: (index: number) => void;
  controller: AbortController | undefined;
  status: 'ready' | 'streaming';
  clear: () => void;
  error: string | null;
  currentThinkingId: string;

  currentConversationId: string | null;
  setCurrentConversationId: (id: string) => void;
  loadConversation: (id: string) => Promise<string | null>;

  model: string;
  setModel: (modelName: string) => void;
  systemPrompt: string;
  setSystemPrompt: (prompt: string) => void;

  isDragging: boolean;
  setIsDragging: (value: boolean) => void;
}

export const useChatStore = create<UseChatStoreProps>((set, get) => ({
  messages: [],
  sendMessage: async (index, message) => {
    const controller = new AbortController();

    set((state) => ({
      messages: [...state.messages.slice(0, index), message],
      status: 'streaming',
      controller: controller,
      currentThinkingId: '',
    }));

    const title = 'title';

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
          messages: [{ role: 'system', content: get().systemPrompt }, ...get().messages],
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
        //console.log(buffer, 'buffer\n');

        while (true) {
          const lineEnd = buffer.indexOf('\n');
          if (lineEnd === -1) break;

          const line = buffer.slice(0, lineEnd).trim();
          buffer = buffer.slice(lineEnd + 1);

          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data) as {
                choices?: Array<{
                  delta?: {
                    reasoning?: unknown;
                    content?: unknown;
                    source?: {
                      id?: string;
                      title?: string;
                      url?: string;
                      sourceType?: string;
                    };
                  };
                }>;
              };

              const delta = parsed.choices?.[0]?.delta ?? {};
              const thinking = typeof delta.reasoning === 'string' ? delta.reasoning : '';
              const answering = typeof delta.content === 'string' ? delta.content : '';
              const source = delta.source;

              /*               if (source) {
                set((state) => {
                  const messages = [...state.messages];
                  if (messages.length === 0 || messages[messages.length - 1].role !== 'assistant') {
                    messages.push({
                      role: 'assistant',
                      content: [],
                    });
                  }

                  const latestMessage = messages[messages.length - 1].content;
                  const sourceId = source.id ?? crypto.randomUUID();
                  const existingIndex = latestMessage.findIndex(
                    (block) => block.type === 'websearch' && block.id === sourceId,
                  );

                  const nextBlock: WebsearchBlock = {
                    id: sourceId,
                    type: 'websearch',
                    content: source.url ?? '',
                    title: source.title ?? source.url ?? 'Search result',
                    url: source.url,
                    sourceType: source.sourceType,
                  };

                  if (existingIndex >= 0) {
                    latestMessage[existingIndex] = nextBlock;
                  } else {
                    latestMessage.push(nextBlock);
                  }

                  return { messages };
                });
                continue;
              } */

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
                      id: crypto.randomUUID(),
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
    if (newMessages.role === 'user') {
      get().sendMessage(index - 1, newMessages as UserMessage);
    }
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
      model: currentConversation.model || 'google/gemini-2.5-flash',
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
  model: 'google/gemini-2.5-flash',
  setModel: (modelName) => {
    set(() => ({ model: modelName }));
  },
  systemPrompt: `请用朴实、平静、耐心的语言回答我的问题，就像一个有经验的朋友在认真地帮我理解一个话题。语气要温和、鼓励，让人感到你愿意花时间把事情讲清楚。不要使用夸张的形容词和营销式的表达，比如"非常棒"、"超级强大"这类词，而是具体说明实际情况就好。

回答时请关注底层原理和运作机制，不只是停留在表面现象。重点说明"为什么"和"怎么做到的"，而不只是"是什么"。涉及具体机制时，说明内部是如何运作的、各个环节如何衔接、过程中发生了什么变化。

在解释复杂概念时，请从最基础的部分讲起，一步步引导到深层内容。如果某个概念需要先理解一些背景知识或相关话题，可以稍微展开解释一下，确保理解的连贯性。把整个话题拆分成容易消化的小步骤，让人能跟上思路。

请主动预见可能产生歧义或困惑的地方，在讲到这些点时停下来做个说明。比如某个术语有多种含义，或者某个步骤容易被误解，就提前澄清。用具体例子和场景来说明抽象概念，指出新手常见的误区和容易忽略的细节。可以适当使用类比，但要确保类比准确，不要为了简化而丢失关键信息。

默认使用完整句子与成段表述；少使用要点式列表。`,
  setSystemPrompt: (prompt) => {
    set(() => ({ systemPrompt: prompt }));
  },
  setCurrentConversationId: (id) => {
    set(() => ({ currentConversationId: id }));
  },
  isDragging: false,
  setIsDragging: (value: boolean) => {
    set(() => ({
      isDragging: value,
    }));
  },
}));
