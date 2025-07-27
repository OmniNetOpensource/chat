"use client";

import { useState, type ChangeEvent, useEffect, useRef } from 'react';

import UpArrowIcon from '../Icons/UpArrowIcon';
import LoadingIcon from '../Icons/LoadingIcon';
import Preview from '../Preview/Preview';
import { useMessageStore } from '@/app/lib/store/useMessageStore';
import CopyIcon from '../Icons/CopyIcon';
import RedoIcon from '../Icons/RedoIcon';
import { useResponsive } from '@/app/lib/hooks/useResponsive';
import CheckIcon from '../Icons/CheckIcon';


const Conversation:React.FC = ()=>{

    const [text,setText] = useState<string>('');
    const {messages, sendMessage,isLoading,cancelResponse,reSendMessage} = useMessageStore();
    const {isMobile} = useResponsive();
    const [copiedId,setCopiedId] = useState<number|null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const initialTextareaHeight = 34; // 定义一个统一的初始高度常量

    // 调整textarea高度的函数
    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            // 重置高度以获得正确的scrollHeight
            textarea.style.height = `${initialTextareaHeight}px`;
            
            // 计算新高度，但有最大行数限制
            const lineHeight = 24; // 估计每行高度为24px
            const maxHeight = isMobile ? lineHeight * 5 : lineHeight * 7;
            const newHeight = Math.min(textarea.scrollHeight, maxHeight);
            
            // 应用新高度
            textarea.style.height = `${newHeight}px`;
        }
    };

    // 当文本变化时调整高度
    const handleTextAreaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        adjustTextareaHeight();
    };

    const handleSendMessage = () => {
        if(canSend && !isLoading){
            sendMessage(text);
            setText('');
            // 重置textarea高度
            if (textareaRef.current) {
                textareaRef.current.style.height = `${initialTextareaHeight}px`;
            }
        }
    }

    const handleCancelResponse = () => {
        cancelResponse();
    }

    const handleKeyDown = (e:React.KeyboardEvent) => {
        if(e.key==='Enter'&&!e.shiftKey){
            e.preventDefault();
            if(canSend){
                handleSendMessage();
            }
        }
    }

    const canSend = text.trim().length>0;


    const handleCopy = (e:React.MouseEvent,content:string,index:number) => {
        navigator.clipboard.writeText(content);
        setCopiedId(index);
        setTimeout(()=>{
            setCopiedId(null);
        },1500);
    }


    return (
        <div className="relative h-full flex-1
                        flex justify-center
                        overflow-y-auto">
            <div className={`flex flex-col
                            ${isMobile ? 'w-[90%]' : 'w-[46%]'}
                            transition-all duration-300 ease-in-out`}>
                {messages.map((msg,index)=>(
                    <div key={index} className='flex flex-col gap-1'>
                        <div className={`w-full 
                                       flex ${msg.type==='user'?'justify-end':'justify-star'}`}>
                            <div className={`
                                            ${msg.type==='user'
                                                ?'bg-user-message-background min-w-[120px] max-w-[70%] w-fit'
                                                :'bg-transparent w-[85%]'}
                                            rounded-[20px] overflow-auto
                                            
                                            transition-all duration-300 ease-in-out`}>
                                <Preview rawContent={msg.content}/>
                            </div>
                        </div>
                        <div className={`h-[40px]
                                        flex flex-row ${isMobile ? 'gap-2' : 'gap-6'} items-center
                                        ${msg.type==='user'?'justify-end':'justify-start'}`}>
                                            <button className={`${isMobile ? 'w-[30px] h-[30px]' : 'w-[40px] h-[40px]'} 
                                                            transition-all duration-300 ease-in-out
                                                            hover:bg-hoverbg rounded-md
                                                            flex justify-center items-center
                                                            cursor-pointer`}
                                                    onClick={(e)=>handleCopy(e,msg.content,index)}>
                                                {copiedId===index?<CheckIcon width={isMobile ? 18 : 22} height={isMobile ? 18 : 22} />:<CopyIcon width={isMobile ? 18 : 22} height={isMobile ? 18 : 22} />}
                                            </button>
                                            {msg.type==='assistant'&&!isLoading&&
                                                <button className={`${isMobile ? 'w-[30px] h-[30px]' : 'w-[40px] h-[40px]'} 
                                                                transition-all duration-300 ease-in-out
                                                                hover:bg-hoverbg rounded-md 
                                                                flex justify-center items-center
                                                                cursor-pointer`}
                                                        onClick={()=>reSendMessage(index)}>
                                                    <RedoIcon width={isMobile ? 18 : 22} height={isMobile ? 18 : 22} />
                                                </button>
                                            }

                        </div>
                    </div>
                ))}
                <div>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <br key={i} />
                    ))}
                </div>
            </div>
            <div className={`fixed bottom-1.5 left-1/2 transform -translate-x-1/2
                            ${isMobile ? 'w-[95%]' : 'w-[80%]'} max-w-[666px] 
                            rounded-lg ${isMobile ? 'px-1.5 py-1.5' : 'px-2 py-2'}
                            bg-input-box
                            flex flex-col gap-3 
                            border border-gray-200
                            transition-all duration-300 ease-in-out`}>
                <textarea
                    ref={textareaRef}
                    className="bg-transparent w-full text-sm overflow-hidden
                            focus:outline-none focus:border-none
                            resize-none"
                    placeholder="prompt in , everything out"
                    value={text}
                    onChange={handleTextAreaChange}
                    onKeyDown={handleKeyDown}
                    style={{height: `${initialTextareaHeight}px`}}
                />

                <div className="my-0 mx-0 w-full h-[24px]
                                flex flex-row gap-1 justify-end">
                    <button className={`bg-primary
                                        ${(isLoading || (canSend && !isLoading))?' cursor-pointer opacity-100':'cursor-default opacity-50'}
                                        rounded-md
                                        py-1 px-[5px]`}
                            onClick={isLoading?handleCancelResponse:handleSendMessage}>
                        {isLoading?<LoadingIcon width={12} height={12}/>:<UpArrowIcon width={12} height={12}/>}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Conversation;
