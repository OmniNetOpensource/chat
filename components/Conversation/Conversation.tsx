'use client';

import React from 'react';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { useChatStore } from '@/lib/store/useChatStore';

const Conversation: React.FC = () => {
  const { messages, setIsDragging } = useChatStore();

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'none';
  };

  return (
    <div
      className="relative flex-1 min-h-0"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
    >
      <div
        className={`overflow-y-auto
                    h-full w-full
        `}
      >
        <MessageList />
      </div>

      <ChatInput index={messages.length} />
    </div>
  );
};

export default Conversation;
