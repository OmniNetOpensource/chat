"use client";

import React, { useState } from 'react';
import Preview from '../Preview/Preview';
import CopyIcon from '../Icons/CopyIcon';
import CheckIcon from '../Icons/CheckIcon';
import RedoIcon from '../Icons/RedoIcon';
import { useResponsive } from '@/app/lib/hooks/useResponsive';
import { useChatStore } from '@/app/lib/store/useChatStore';
import EditIcon from '../Icons/EditIcon';


const MessageList: React.FC = () => {
  const { messages, status, regenerate } = useChatStore();
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const {isMobile} = useResponsive();

  const handleCopy = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedId(index);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className={`mx-auto flex flex-col ${
          isMobile ? 'w-[90%]' : 'w-[46%]'
        } transition-all duration-300 ease-in-out`}>
      {messages.map((msg,index) => (
        <div key={index} className="group
                                    flex flex-col gap-1">
          <div className={`w-full flex ${msg.role === 'user' ? 'justify-end' : 'justify-star'}`}>
            <div
              className={`w-fit
                ${msg.role === 'user'
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
                handleCopy(msg.content.map((m)=>(m.type === 'text'? m.text:'')).join(), index)
              }
            >
              {copiedId === index ? (
                <CheckIcon width={isMobile ? 14 : 18} height={isMobile ? 14 : 18} />
              ) : (
                <CopyIcon width={isMobile ? 14 : 18} height={isMobile ? 14 : 18} />
              )}
            </button>

            {msg.role === 'assistant' && status === 'ready' && (
              <button
                className={`${
                  isMobile ? 'w-[24px] h-[24px]' : 'w-[32px] h-[32px]'
                } transition-all duration-300 ease-in-out hover:bg-hoverbg rounded-md flex justify-center items-center cursor-pointer`}
                onClick={() => regenerate(index)}
              >
                <RedoIcon width={isMobile ? 14 : 18} height={isMobile ? 14 : 18} />
              </button> 
            )}

            {msg.role === 'user' && status ==='ready' &&(
              <button
                className={`${
                  isMobile ? 'w-[24px] h-[24px]' : 'w-[32px] h-[32px]'
                } transition-all duration-300 ease-in-out hover:bg-hoverbg rounded-md flex justify-center items-center cursor-pointer`}
                onClick={() => regenerate(index)}
              >
                <EditIcon width={isMobile ? 14 : 18} height={isMobile ? 14 : 18} />
              </button> 
            )}
          </div>
        </div>
      ))}

      <div>
        {Array.from({ length: 5 }).map((_, i) => (
          <br key={i} />
        ))}
      </div>
    </div>
  );
};

export default MessageList;
