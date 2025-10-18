'use client';

import React, { useEffect, useState } from 'react';
import Preview from '../Preview/Preview';
import CopyIcon from '../Icons/CopyIcon';
import CheckIcon from '../Icons/CheckIcon';
import RedoIcon from '../Icons/RedoIcon';
import { useResponsive } from '@/app/lib/hooks/useResponsive';
import { useChatStore } from '@/app/lib/store/useChatStore';
import EditIcon from '../Icons/EditIcon';
import ChatInput from './ChatInput';

const MessageList: React.FC = () => {
  const { messages, status, regenerate } = useChatStore();
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [editing, setEditing] = useState<boolean[]>([]);
  const { isMobile } = useResponsive();

  const handleCopy = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedId(index);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleStartEdit = (index: number) => {
    setEditing((prev) => prev.map((value, arrayIndex) => (arrayIndex === index ? !value : value)));
  };
  const handleFinishEdit = (index: number) => {
    setEditing((prev) => prev.map((value, arrayIndex) => (arrayIndex === index ? !value : value)));
  };

  useEffect(() => {
    setEditing((prevEditing) => {
      const next = [...prevEditing];
      while (next.length < messages.length) {
        next.push(false);
      }
      next.length = messages.length;
      return next;
    });
  }, [messages]);

  return (
    <div
      className={`mx-auto flex flex-col ${
        isMobile ? 'w-[90%]' : 'w-[60%]'
      } transition-all duration-300 ease-in-out`}
    >
      {messages.map((msg, index) => (
        <div
          key={index}
          className="group
                                    flex flex-col gap-1"
        >
          {editing[index] === true ? (
            <div
              className={`w-full flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} relative`}
            >
              <ChatInput
                index={index}
                editing={true}
                onFinishEdit={() => handleFinishEdit(index)}
              />
              <button
                className="absolute bottom-2 right-[48px] z-floating-button
                bg-primary rounded-md py-1 px-[5px] text-secondary
                cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleFinishEdit(index)}
              >
                cancel
              </button>
            </div>
          ) : (
            <>
              <div
                className={`w-full flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`w-fit
                  ${
                    msg.role === 'user'
                      ? 'bg-user-message-background max-w-[60%] px-4 '
                      : 'bg-transparent max-w-[100%] px-4 py-2'
                  }
                  rounded-[15px] h-fit py-2  flex flex-col items-center 
                  transition-all duration-300 ease-in-out
                  `}
                >
                  <Preview rawContent={msg.content} />
                </div>
              </div>

              <div
                className={`flex flex-row ${
                  isMobile ? 'h-[36px] gap-3' : 'h-[28px] gap-0.5'
                } items-center ${msg.role === 'user' ? 'justify-end' : 'justify-start'}
              group-hover:opacity-100
              `}
              >
                {(status === 'ready' || msg.role === 'user') && (
                  <button
                    className={`${
                      isMobile ? 'w-[32px] h-[32px]' : 'w-[24px] h-[24px]'
                    } transition-all duration-300 ease-in-out hover:bg-hoverbg rounded-md flex justify-center items-center cursor-pointer`}
                    onClick={() =>
                      handleCopy(
                        msg.content.map((m) => (m.type === 'text' ? m.text : '')).join(''),
                        index,
                      )
                    }
                  >
                    {copiedId === index ? (
                      <CheckIcon
                        width={isMobile ? 20 : 16}
                        height={isMobile ? 20 : 16}
                      />
                    ) : (
                      <CopyIcon
                        width={isMobile ? 20 : 16}
                        height={isMobile ? 20 : 16}
                      />
                    )}
                  </button>
                )}

                {msg.role === 'assistant' && status === 'ready' && (
                  <button
                    className={`${
                      isMobile ? 'w-[32px] h-[32px]' : 'w-[24px] h-[24px]'
                    } transition-all duration-300 ease-in-out hover:bg-hoverbg rounded-md flex justify-center items-center cursor-pointer`}
                    onClick={() => regenerate(index)}
                  >
                    <RedoIcon
                      width={isMobile ? 20 : 16}
                      height={isMobile ? 20 : 16}
                    />
                  </button>
                )}

                {msg.role === 'user' && status === 'ready' && (
                  <button
                    className={`${
                      isMobile ? 'w-[32px] h-[32px]' : 'w-[24px] h-[24px]'
                    } transition-all duration-300 ease-in-out hover:bg-hoverbg rounded-md flex justify-center items-center cursor-pointer`}
                    onClick={() => handleStartEdit(index)}
                  >
                    <EditIcon
                      width={isMobile ? 20 : 16}
                      height={isMobile ? 20 : 16}
                    />
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      ))}

      <div className="h-[200px]" />
    </div>
  );
};

export default MessageList;
