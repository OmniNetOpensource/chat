'use client';

import { create } from 'zustand';
import { saveConversation, getConversation } from '../services/indexedDBService';

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
  sendMessage: (index: number, content: Content[]) => Promise<string | null>; // Return conversationId for new conversations
  stop: () => void;
  regenerate: (index: number) => void;
  controller: AbortController | undefined;
  status: 'ready' | 'streaming';
  clear: () => void;

  currentThinkingId: string;

  editing: number;
  error: string | null;

  currentConversationId: string | null;
  loadConversation: (id: string) => Promise<string | null>; // Return conversationId
}

export const useChatStore = create<UseChatStoreProps>((set, get) => ({
  messages: [],
  sendMessage: async (index, content) => {
    const controller = new AbortController();
    set({
      messages: [...get().messages.slice(0, index), { role: 'user', content: content }],
      status: 'streaming',
      controller: controller,
    });
    let conversationId = get().currentConversationId;
    let isNewConversation = false;
    try {
      const messagesToSend = get().messages.map((msg) => {
        return {
          role: msg.role,
          content: msg.content.filter((c) => c.type !== 'thinking'),
        };
      });
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'x-ai/grok-4-fast:free',
          messages: messagesToSend,
          stream: true,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        set({
          error: `Failed to send message: ${response.status} ${response.statusText}. ${errorText}`,
        });
        return null;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      if (conversationId) {
        const existing = await getConversation(conversationId);
        if (existing) {
          await saveConversation({
            ...existing,
            messages: get().messages,
            updatedAt: Date.now(),
          });
        }
      } else {
        isNewConversation = true;
        conversationId = crypto.randomUUID();
        const title = get()
          .messages[0].content.filter((m) => m.type === 'text')
          .join('')
          .slice(0, 10);
        await saveConversation({
          id: conversationId,
          title,
          messages: get().messages,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        set({ currentConversationId: conversationId });
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
                    set({ currentThinkingId: newId });
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
                    set({ currentThinkingId: '' });
                  }
                }

                return { messages };
              });
            } catch (e) {
              console.error('Error parsing stream data:', e);
            }
          }
        }
      }
      return isNewConversation ? conversationId : null;
    } catch (error) {
      if (!(error instanceof Error && error.name === 'AbortError')) {
        console.error('Request error:', error);
      }
      return null;
    } finally {
      set({ status: 'ready', controller: undefined });
      const existing = await getConversation(get().currentConversationId as string);
      if (existing) {
        await saveConversation({
          ...existing,
          messages: get().messages,
          updatedAt: Date.now(),
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
    set({
      messages: [],
      status: 'ready',
      controller: undefined,
      currentConversationId: null,
      currentThinkingId: '',
    });
  },
  currentMessage: [],
  currentThinkingId: '',

  editing: -1,

  currentConversationId: null,
  loadConversation: async (id) => {
    const currentConversation = await getConversation(id);
    set({ messages: currentConversation.messages, currentConversationId: currentConversation.id });
    return currentConversation.id;
  },
  error: null,
}));