'use client';

import React from 'react';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { useChatStore } from '@/app/lib/store/useChatStore';

const Conversation: React.FC = () => {
  const { messages } = useChatStore();

  return (
    <div className="relative flex-1 min-h-0">
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
