"use client";

import {  useState, type ChangeEvent } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

import UpArrowIcon from '../Icons/UpArrowIcon';
import LoadingIcon from '../Icons/LoadingIcon';
import Preview from '../Preview/Preview';
import { useHandleMessage } from "@/app/lib/store/handleMessages";



const Conversation:React.FC = ()=>{

    const [text,setText] = useState<string>('');
    const {messages, sendMessage,isLoading} = useHandleMessage();

    const handleTextAreaChange = (e:ChangeEvent<HTMLTextAreaElement>)=>{
        setText(e.target.value);
    }

    const handleSendMessage = () => {
        if(canSend && !isLoading){
            sendMessage(text);
            setText('');
        }
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

    return (
        <div className="relative h-full flex-1
                        flex justify-center
                        overflow-y-auto">
            <div className='flex flex-col
                            w-[60%]
                            '>
                {messages.map((msg,index)=>(
                    <div key={index} className={`w-full border-b-1
                                                flex ${msg.type==='user'?'justify-end':'justify-star'}`}>
                        <div className='w-[70%] bg-secondary'>
                            <Preview rawContent={msg.content}/>
                        </div>
                    </div>
                ))}
                <div>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <br key={i} />
                    ))}
                </div>
            </div>
            <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2
                            w-[666px] 
                            rounded-lg px-2 py-2
                            bg-input-box
                            flex flex-col gap-3 m-3.5
                            border border-gray-200">
                <TextareaAutosize className="bg-transparent w-full text-sm overflow-y-auto
                                focus:outline-none focus:border-none
                                resize-none" 
                                placeholder="prompt in , everything out"
                                minRows={1}
                                maxRows={7}
                                value={text}
                                onChange={handleTextAreaChange}
                                onKeyDown={handleKeyDown}
                />

                <div className="my-0 mx-0 w-full h-[24px]
                                flex flex-row gap-1 justify-end">
                    <button className={`bg-primary
                                        ${(canSend && !isLoading)?' cursor-pointer opacity-100':'cursor-default opacity-50'}
                                        rounded-md
                                        py-1 px-[5px]`}
                            onClick={handleSendMessage}>
                        {isLoading?<LoadingIcon width={12} height={12}/>:<UpArrowIcon width={12} height={12}/>}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Conversation;
