'use client'

import { create } from 'zustand'

interface TextContent {
    type: 'text',
    text: string,
}

interface ImageContent {
    type: 'image',
    image_url: {
        url: string,
    }
}

interface FileContent {
    type: 'file',
    file: {
        filename: string,
        file_data: string,
    }
}

interface AudioContent {
    type: "input_audio",
    input_audio: {
        data: string,
        format: "wav" | 'mp3',
    },
}

interface ThinkingContent {
    type: "thinking",
    text: string,
}

export type MessageContent = TextContent | ImageContent | FileContent | AudioContent | ThinkingContent;

interface Message {
    role: 'user' | 'system' | 'assistant',
    content: MessageContent[],
}

interface UseChatStoreProps {
    messages: Message[];
    sendMessage: (content: MessageContent[]) => void;
    stop: () => void;
    regenerate: (index: number) => void;
    controller: AbortController | undefined;
    status: 'ready' | 'streaming';
    clear:()=>void,
}

export const useChatStore = create<UseChatStoreProps>((set, get) => ({
    messages: [],
    sendMessage: async (content: MessageContent[]) => {
        const controller = new AbortController();
        set({
            messages: [...get().messages, { role: 'user', content: content }],
            status: 'streaming',
            controller: controller,
        });
        
        try {
            const messagesToSend = get().messages.map((msg)=>{
                return {
                    ...msg,
                    content: msg.content.filter((c) => c.type !== 'thinking'),
                }
            });
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'google/gemini-2.5-pro',
                    messages: messagesToSend,
                    stream: true,
                }),
                signal: controller.signal,
            });

            if (!response.ok) {
                console.error('no response');
                return;
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('Response body is not readable');
            }

            const decoder = new TextDecoder();

            let buffer = '';
            let responseContent = '';
            let thinkingContent = '';

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

                            thinkingContent+= (parsed.choices[0].delta.reasoning) || '';
                            responseContent += (parsed.choices[0].delta.content) || '';

                            const thinking = parsed.choices[0].delta.reasoning;
                            const answering = parsed.choices[0].delta.content;

                            set((state) => {
                                const messages = [...state.messages];
                                
                                if (messages.length === 0 || messages[messages.length - 1].role !== 'assistant') {
                                    messages.push({
                                        role: 'assistant',
                                        content: []
                                    });
                                }
                                
                                const lastMessage = messages[messages.length - 1].content;
                                const lastContent = lastMessage[lastMessage.length - 1] || {};
                                
                                if (thinking) {
                                    const isLastThinking = (lastContent&&lastContent.type==='thinking');
                                    
                                    if (isLastThinking) {
                                        lastContent.text += thinking;
                                    } else {
                                        lastMessage.push({
                                            type: 'thinking',
                                            text: thinking
                                        });
                                    }
                                }
                                
                                if (answering) {
                                    const isLastContent = (lastContent&&lastContent.type==='text');
                                    
                                    if (isLastContent) {
                                        lastContent.text += answering;
                                    } else {
                                        lastMessage.push({
                                            type: 'text',
                                            text: answering,
                                        });
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
        } catch (e) {
            console.error('Request error:', e);
        } finally {
            set({ status: 'ready', controller: undefined });
        }
    },
    
    stop: () => {
        get().controller?.abort();
    },
    
    regenerate: (index: number) => {
        console.log(`Regenerating message at index: ${index}`);
    },
    
    controller: undefined,
    status: 'ready',
    clear:()=>{
        set(({
            messages:[],
            status:'ready',
            controller:undefined,
        }))
    }
}));