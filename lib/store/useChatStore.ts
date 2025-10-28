'use client';

import { create } from 'zustand';
import { saveConversation, getConversation } from '../services/indexedDBService';
import { type MessageBlock, type MessageType, type UserMessage } from '../types';

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
  currentTextId: string;

  currentConversationId: string | null;
  setCurrentConversationId: (id: string) => void;
  loadConversation: (id: string) => Promise<string | null>;

  model: string;
  setModel: (modelName: string) => void;
  systemPrompt: string;
  setSystemPrompt: (prompt: string) => void;

  isDragging: boolean;
  setIsDragging: (value: boolean) => void;

  enableSearch: boolean;
  setEnableSearch: (enabled: boolean) => void;
}

function ensureAssistantMessage(state: UseChatStoreProps): {
  messages: MessageType[];
  assistantMessage: MessageBlock[];
} {
  const messages = [...state.messages];
  if (messages.length === 0 || messages[messages.length - 1].role !== 'assistant') {
    messages.push({
      role: 'assistant',
      content: [],
    });
  }

  return {
    messages,
    assistantMessage: messages[messages.length - 1].content,
  };
}

export const useChatStore = create<UseChatStoreProps>((set, get) => ({
  messages: [],
  enableSearch: false,
  sendMessage: async (index, message) => {
    const controller = new AbortController();

    set((state) => ({
      messages: [...state.messages.slice(0, index), message],
      status: 'streaming',
      controller: controller,
      currentTextId: '',
      error: null,
    }));

    const title = 'title';

    await saveConversation({
      id: get().currentConversationId as string,
      title,
      messages: get().messages,
      updatedAt: Date.now(),
      model: get().model,
      systemPrompt: get().systemPrompt,
      enableSearch: get().enableSearch,
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
          enableSearch: get().enableSearch,
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

        // 按照 SSE 格式分割（data: {...}\n\n）
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || ''; // 保留不完整的最后一行

        for (const line of lines) {
          if (!line.trim()) continue;

          // 移除 "data: " 前缀
          const dataStr = line.replace(/^data:\s*/, '');
          if (dataStr === '[DONE]') break;

          try {
            const data = JSON.parse(dataStr);

            if (data.type === 'finish') break;

            switch (data.type) {
              case 'reasoning-start': {
                const thinkingId = data.id;
                set((state) => {
                  const { messages, assistantMessage } = ensureAssistantMessage(state);
                  assistantMessage.push({
                    id: thinkingId,
                    type: 'thinking',
                    text: '',
                    time: Date.now(),
                    finished: false,
                  });
                  return { messages };
                });
                break;
              }

              case 'reasoning-delta': {
                set((state) => {
                  const { messages, assistantMessage } = ensureAssistantMessage(state);
                  const lastBlock = assistantMessage[assistantMessage.length - 1];

                  if (lastBlock?.type === 'thinking') {
                    // 创建一个新的 block 对象来替代旧的
                    const updatedBlock = {
                      ...lastBlock,
                      text: lastBlock.text + (data.text || ''),
                    };

                    // 创建一个新的 content 数组，并用新 block 替换最后一个元素
                    const newContent = [...assistantMessage.slice(0, -1), updatedBlock];

                    // 替换 messages 数组中最后一个元素的 content
                    const lastMessage = messages[messages.length - 1];
                    if (lastMessage.role === 'assistant') {
                      const updatedMessage = { ...lastMessage, content: newContent };
                      return { messages: [...messages.slice(0, -1), updatedMessage] };
                    }
                  }

                  return { messages };
                });
                break;
              }

              case 'reasoning-end': {
                set((state) => {
                  const { messages, assistantMessage } = ensureAssistantMessage(state);
                  const lastBlock = assistantMessage[assistantMessage.length - 1];
                  if (lastBlock?.type === 'thinking') {
                    const updatedBlock = {
                      ...lastBlock,
                      finished: true,
                      time: Math.round((Date.now() - lastBlock.time) / 1000),
                    };
                    const newContent = [...assistantMessage.slice(0, -1), updatedBlock];
                    const lastMessage = messages[messages.length - 1];
                    if (lastMessage.role === 'assistant') {
                      const updatedMessage = { ...lastMessage, content: newContent };
                      return { messages: [...messages.slice(0, -1), updatedMessage] };
                    }
                  }

                  return { messages };
                });
                break;
              }

              case 'text-start': {
                const textId = data.id;
                set((state) => {
                  const { messages, assistantMessage } = ensureAssistantMessage(state);
                  assistantMessage.push({
                    id: textId,
                    type: 'text',
                    text: '',
                  });
                  return { messages, currentTextId: textId };
                });
                break;
              }

              case 'text-delta': {
                set((state) => {
                  const { messages, assistantMessage } = ensureAssistantMessage(state);
                  const lastBlock = assistantMessage[assistantMessage.length - 1];
                  if (lastBlock?.type === 'text') {
                    const updatedBlock = {
                      ...lastBlock,
                      text: lastBlock.text + (data.text || ''),
                    };
                    const newContent = [...assistantMessage.slice(0, -1), updatedBlock];
                    const lastMessage = messages[messages.length - 1];
                    if (lastMessage.role === 'assistant') {
                      const updatedMessage = { ...lastMessage, content: newContent };
                      return { messages: [...messages.slice(0, -1), updatedMessage] };
                    }
                  }
                  return { messages };
                });
                break;
              }

              case 'error': {
                set((state) => {
                  const { messages, assistantMessage } = ensureAssistantMessage(state);
                  assistantMessage.push({
                    id: crypto.randomUUID(),
                    type: 'text',
                    text: `❌ Error: ${data.error || data.message || 'An error occurred'}`,
                  });
                  return {
                    messages,
                    error: data.error || data.message || 'An error occurred',
                    status: 'ready',
                  };
                });
                // 错误发生后停止处理流
                reader.cancel();
                break;
              }

              default:
                // Ignore unknown types
                break;
            }
          } catch (e) {
            console.warn('Failed to parse SSE chunk:', dataStr, e);
          }
        }
      }
    } catch (error) {
      if (!(error instanceof Error && error.name === 'AbortError')) {
        console.error('Request error:', error);
      }
    } finally {
      set(() => ({
        status: 'ready',
        controller: undefined,
        currentTextId: '',
      }));
      const existing = await getConversation(get().currentConversationId as string);
      if (existing) {
        await saveConversation({
          ...existing,
          messages: get().messages,
          updatedAt: Date.now(),
          model: get().model,
          systemPrompt: get().systemPrompt,
          enableSearch: get().enableSearch,
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
      currentTextId: '',
    }));
  },
  currentMessage: [],
  currentTextId: '',

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
    const enableSearch = currentConversation.enableSearch ?? false;
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
      enableSearch,
    }));
    try {
      localStorage.setItem('enableSearch', JSON.stringify(enableSearch));
    } catch (error) {
      console.warn('Failed to persist enableSearch from conversation', error);
    }
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
  setEnableSearch: (enabled) => {
    set(() => ({ enableSearch: enabled }));
    try {
      localStorage.setItem('enableSearch', JSON.stringify(enabled));
    } catch (error) {
      console.warn('Failed to persist enableSearch preference', error);
    }
  },
}));
