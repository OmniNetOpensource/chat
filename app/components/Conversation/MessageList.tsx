"use client";

import React, { useEffect, useState } from 'react';
import Preview from '../Preview/Preview';
import CopyIcon from '../Icons/CopyIcon';
import CheckIcon from '../Icons/CheckIcon';
import RedoIcon from '../Icons/RedoIcon';
import { useResponsive } from '@/app/lib/hooks/useResponsive';
import { useChatStore, type Content } from '@/app/lib/store/useChatStore';
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
    setEditing(() => {
      const next = editing.map((value, arrayIndex) => (arrayIndex === index ? !value : value));
      console.log(next);
      return next;
    });
  };
  const handleFinishEdit = (index: number) => {
    setEditing(() => {
      const next = editing.map((value, arrayIndex) => (arrayIndex === index ? !value : value));
      return next;
    });
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
        isMobile ? 'w-[90%]' : 'w-[46%]'
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
              className={`w-full flex ${msg.role === 'user' ? 'justify-end' : 'justify-star'} relative`}
            >
              <ChatInput
                index={index}
                fileContent={msg.content
                  .filter(
                    (m): m is Extract<Content, { type: 'image_url' }> => m.type === 'image_url',
                  )
                  .map((m) => m.image_url.url)}
                textContent={msg.content
                  .filter((m): m is Extract<Content, { type: 'text' }> => m.type === 'text')
                  .map((m) => m.text)
                  .join('')}
                editing={true}
                onFinishEdit={() => handleFinishEdit(index)}
              />
              <button
                className="absolute top-0 right-0 z-20 -translate-y-1/2 translate-x-1/2
               px-2 py-1 text-sm bg-neutral-800 text-text-primary rounded-md hover:bg-neutral-700"
                onClick={() => handleFinishEdit(index)}
              >
                cancle
              </button>
            </div>
          ) : (
            <>
              <div
                className={`w-full flex ${msg.role === 'user' ? 'justify-end' : 'justify-star'}`}
              >
                <div
                  className={`w-fit
                  ${
                    msg.role === 'user'
                      ? 'bg-user-message-background max-w-[60%] px-4 '
                      : 'bg-transparent max-w-[100%] px-4 py-2'
                  } 
                  rounded-[15px] h-fit 
                  transition-all duration-300 ease-in-out`}
                >
                  <Preview rawContent={msg.content} />
                </div>
              </div>

              <div
                className={`h-[32px] flex flex-row ${
                  isMobile ? 'gap-2' : 'gap-6'
                } items-center ${msg.role === 'user' ? 'justify-end' : 'justify-start'}
              opacity-0 group-hover:opacity-100
              `}
              >
                <button
                  className={`${
                    isMobile ? 'w-[24px] h-[24px]' : 'w-[32px] h-[32px]'
                  } transition-all duration-300 ease-in-out hover:bg-hoverbg rounded-md flex justify-center items-center cursor-pointer`}
                  onClick={() =>
                    handleCopy(
                      msg.content.map((m) => (m.type === 'text' ? m.text : '')).join(),
                      index,
                    )
                  }
                >
                  {copiedId === index ? (
                    <CheckIcon
                      width={isMobile ? 14 : 18}
                      height={isMobile ? 14 : 18}
                    />
                  ) : (
                    <CopyIcon
                      width={isMobile ? 14 : 18}
                      height={isMobile ? 14 : 18}
                    />
                  )}
                </button>

                {msg.role === 'assistant' && status === 'ready' && (
                  <button
                    className={`${
                      isMobile ? 'w-[24px] h-[24px]' : 'w-[32px] h-[32px]'
                    } transition-all duration-300 ease-in-out hover:bg-hoverbg rounded-md flex justify-center items-center cursor-pointer`}
                    onClick={() => regenerate(index)}
                  >
                    <RedoIcon
                      width={isMobile ? 14 : 18}
                      height={isMobile ? 14 : 18}
                    />
                  </button>
                )}

                {msg.role === 'user' && status === 'ready' && (
                  <button
                    className={`${
                      isMobile ? 'w-[24px] h-[24px]' : 'w-[32px] h-[32px]'
                    } transition-all duration-300 ease-in-out hover:bg-hoverbg rounded-md flex justify-center items-center cursor-pointer`}
                    onClick={() => handleStartEdit(index)}
                  >
                    <EditIcon
                      width={isMobile ? 14 : 18}
                      height={isMobile ? 14 : 18}
                    />
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      ))}

      <div>
        {Array.from({ length: 10 }).map((_, i) => (
          <br key={i} />
        ))}
      </div>
    </div>
  );
};

export default MessageList;

