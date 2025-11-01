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
  conversationTitle: string | null;
  setConversationTitle: (title: string | null) => void;

  model: string;
  setModel: (modelName: string) => void;

  isDragging: boolean;
  setIsDragging: (value: boolean) => void;
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

function extractTextFromBlocks(blocks: MessageBlock[]): string {
  return blocks
    .map((block) => {
      if (block.type === 'text') {
        return block.text;
      }
      if (block.type === 'websearch') {
        return block.content;
      }
      return '';
    })
    .filter((chunk) => chunk && chunk.trim().length > 0)
    .join('\n')
    .trim();
}

async function requestConversationTitle(
  userMessage: string,
  assistantMessage: string,
): Promise<string | null> {
  try {
    const response = await fetch('/api/generate-title', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userMessage,
        assistantMessage,
      }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error(
        'Failed to generate conversation title:',
        response.status,
        response.statusText,
        responseText,
      );
      return null;
    }

    const title = responseText.trim();
    return title.length > 0 ? title : null;
  } catch (error) {
    console.error('Error generating conversation title', error);
    return null;
  }
}

export const useChatStore = create<UseChatStoreProps>((set, get) => ({
  messages: [],
  conversationTitle: null,
  setConversationTitle: (title) => {
    set(() => ({ conversationTitle: title }));
  },
  sendMessage: async (index, message) => {
    const controller = new AbortController();

    set((state) => ({
      messages: [...state.messages.slice(0, index), message],
      status: 'streaming',
      controller: controller,
      currentTextId: '',
      error: null,
      conversationTitle: state.messages.length === 0 ? 'new chat' : state.conversationTitle,
    }));

    const conversationId = get().currentConversationId as string;
    const conversationTitle = get().conversationTitle ?? 'new chat';

    await saveConversation({
      id: conversationId,
      title: conversationTitle,
      messages: get().messages,
      updatedAt: Date.now(),
      model: get().model,
    });

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: get().model,
          messages: get().messages,
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
      const conversationId = get().currentConversationId;

      let stateSnapshot = get();
      const existing = await getConversation(conversationId);

      let updatedTitle = stateSnapshot.conversationTitle ?? existing?.title ?? 'new chat';

      if (stateSnapshot.conversationTitle === 'new chat' && stateSnapshot.messages.length === 2) {
        const [firstMessage, secondMessage] = stateSnapshot.messages;

        if (firstMessage?.role === 'user' && secondMessage?.role === 'assistant') {
          const userText = extractTextFromBlocks(firstMessage.content);
          const assistantText = extractTextFromBlocks(secondMessage.content);

          const generatedTitle = await requestConversationTitle(userText, assistantText);
          if (generatedTitle) {
            set(() => ({ conversationTitle: generatedTitle }));
            updatedTitle = generatedTitle;
            stateSnapshot = { ...stateSnapshot, conversationTitle: generatedTitle };
          }
        }
      }

      const recordToSave = {
        ...(existing ?? { id: conversationId, title: updatedTitle }),
        title: updatedTitle,
        messages: stateSnapshot.messages,
        updatedAt: Date.now(),
        model: stateSnapshot.model,
      };
      await saveConversation(recordToSave);
      set(() => ({
        status: 'ready',
        controller: undefined,
        currentTextId: '',
      }));
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
      conversationTitle: null,
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
    set(() => ({
      messages: currentConversation.messages,
      currentConversationId: currentConversation.id,
      conversationTitle: currentConversation.title,
      model: currentConversation.model,
    }));
    return currentConversation.id;
  },
  error: null,
  model: 'google/gemini-2.5-flash',
  setModel: (modelName) => {
    set(() => ({ model: modelName }));
  },
  setCurrentConversationId: (id) => {
    set((state) => ({
      currentConversationId: id,
      conversationTitle:
        id === null
          ? null
          : state.messages.length === 0
            ? 'new chat'
            : (state.conversationTitle ?? 'new chat'),
    }));
  },
  isDragging: false,
  setIsDragging: (value: boolean) => {
    set(() => ({
      isDragging: value,
    }));
  },
}));
