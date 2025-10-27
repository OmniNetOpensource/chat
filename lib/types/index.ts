export interface TextBlock {
  id: string;
  type: 'text';
  text: string;
}

export interface WebsearchBlock {
  id: string;
  type: 'websearch';
  content: string;
  title?: string;
  url?: string;
  sourceType?: string;
}

export interface ImageBlock {
  id: string;
  type: 'image';
  base64: string;
}

export interface FileBlock {
  id: string;
  type: 'file';
  base64: string;
}

export interface ThinkingBlock {
  id: string;
  type: 'thinking';
  text: string;
  time: number;
}

export type MessageBlock = TextBlock | WebsearchBlock | ImageBlock | FileBlock | ThinkingBlock;

export interface AssistantMessage {
  role: 'assistant';
  content: MessageBlock[];
}

export interface UserMessage {
  role: 'user';
  content: MessageBlock[];
}

export type MessageType = UserMessage | AssistantMessage;

//DB version 1:
// Types for API communication
export interface TextContent {
  type: 'text';
  text: string;
}

export interface ImageContent {
  type: 'image_url';
  image_url: {
    url: string;
  };
}

export interface ThinkingContent {
  type: 'thinking';
  text: string;
  id: string;
  time: number;
}
export interface FileContent {
  type: 'file';
  file: {
    filename: string;
    file_data: string;
  };
}

export type Content = TextContent | ThinkingContent | ImageContent | FileContent;

export interface Message {
  role: 'user' | 'system' | 'assistant';
  content: Content[];
}
