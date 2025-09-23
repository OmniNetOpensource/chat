"use client";

import React from 'react';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

const Conversation: React.FC = () => {

  return (
    <div className="relative flex-1 min-h-0">
      <div
        className={`overflow-y-auto
                    h-full w-full
        `}
      >
        <MessageList />
      </div>

      <ChatInput
        index={999}
        fileContent={[]}
        textContent=""
      />
    </div>
  );
};

export default Conversation;
