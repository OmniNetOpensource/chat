"use client";

import React, { useState, useRef, type ChangeEvent, useEffect } from 'react';
import UpArrowIcon from '../Icons/UpArrowIcon';
import LoadingIcon from '../Icons/LoadingIcon';
import { useResponsive } from '@/app/lib/hooks/useResponsive';
import { useChatStore } from '@/app/lib/store/useChatStore';

const ChatInput: React.FC = () => {
  const { status, sendMessage } = useChatStore();
  const [text, setText] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const initialTextareaHeight = 24;
  const {isMobile} = useResponsive();

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${initialTextareaHeight}px`;
      const lineHeight = 24;
      const maxHeight = isMobile ? lineHeight * 5 : lineHeight * 7;
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = `${newHeight}px`;
    }
  };

  const handleTextAreaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    adjustTextareaHeight();
  };

  const canSend = text.trim().length > 0;

  const handleSendMessage = () => {
    console.log(1,text);
    if (canSend && status === 'ready') {
      console.log(2,text);
      sendMessage([{type:'text',text:text}]);
      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = `${initialTextareaHeight}px`;
      }
      
    }
  };  

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSend) {
        handleSendMessage();
      }
    }
  };

  useEffect(() => {
    console.log(status);
  }, [status])


  return (
    <div
      className={`absolute bottom-1.5 left-1/2 transform -translate-x-1/2 ${
        isMobile ? 'w-[95%]' : 'w-[46%]'
      } rounded-lg ${isMobile ? 'px-1.5 py-1.5' : 'px-2 py-2'} 
      bg-secondary flex flex-col gap-3 border-none 
      transition-all duration-300 ease-in-out`}
    >
      <textarea
        ref={textareaRef}
        className="bg-transparent w-full text-sm overflow-y-auto focus:outline-none focus:border-none resize-none pl-1.5"
        placeholder="prompt in , everything out"
        value={text}
        onChange={handleTextAreaChange}
        onKeyDown={handleKeyDown}
        style={{ height: `${initialTextareaHeight}px` }}
      />

      <div className="my-0 mx-0 w-full h-[32px] flex flex-row gap-1 justify-end">
        <button
          className={`bg-primary ${
            status === 'streaming'  || (canSend && status === 'ready')
              ? ' cursor-pointer opacity-100'
              : 'cursor-not-allowed opacity-10'
          } rounded-md py-1 px-[5px]
            text-secondary`}
          onClick={status === 'streaming'? stop : handleSendMessage}
        >
          {status === 'streaming' ? (
            <LoadingIcon width={20} height={20} />
          ) : (
            <UpArrowIcon width={20} height={20} />
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
