
"use client";

import useRenderContent from "./hooks/useRenderContent";
import { useEffect, forwardRef, useRef, useImperativeHandle, useState } from 'react';
import './Preview.css';
import 'katex/dist/katex.min.css'
import { MessageContent, useChatStore } from "@/app/lib/store/useChatStore";
import SlideLight from "../SlideLight/SlideLight";

interface PreviewProps {
    rawContent: MessageContent[];
}

const MessageRenderer = ({ msg, index }: { msg: MessageContent, index: number }) => {
    const [isExpand, setIsExpand] = useState<boolean>(false);
    const {status} = useChatStore();
    
    if (msg.type !== 'text' && msg.type !== 'thinking') {
        return null;
    }

    const html = useRenderContent(msg.text);

    if (msg.type === 'text') {
        return (
            <div
                className="preview-content show-area"
                dangerouslySetInnerHTML={{ __html: html }}
            />
        );
    }
    
    if (msg.type === 'thinking') {
        return (
            <>
                <button onClick={()=>{setIsExpand(!isExpand)}} className="cursor-pointer">
                    { status === 'streaming'
                        ? <SlideLight text={`Thinking...`}/>
                        : <span>thought</span>}
                </button>
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isExpand ? 'max-h-96' : 'max-h-0'
                } opacity-60 text-sm leading-tight overflow-y-auto`}>
                    <div
                        className="preview-content show-area p-2"
                        dangerouslySetInnerHTML={{ __html: html }}
                    />
                </div>
            </>
        );
    }

    return null;
}

const Preview = forwardRef<HTMLDivElement, PreviewProps>(({ rawContent }, parentRef) => {
    const localRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(parentRef, () => localRef.current!, []);

    useEffect(() => {
        const handleclick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (target.classList.contains('copy-button')) {
                if (target.textContent !== 'copy') {
                    return;
                }

                const codeToCopy = target.dataset.rawCode ?? '';
                navigator.clipboard.writeText(codeToCopy).then(() => {
                    target.textContent = '√ copied';
                    setTimeout(() => {
                        target.textContent = 'copy';
                    }, 1000);
                }).catch(err => {
                    console.error('无法复制到剪切板', err);
                })
            }
        }

        const previewElement = localRef.current;
        if (previewElement) {
            previewElement.addEventListener('click', handleclick);
        }
        
        return () => {
            if (previewElement) {
                previewElement.removeEventListener('click', handleclick);
            }
        }
    }, []);

    return (
        <div ref={localRef} className="h-fit w-full text-text-primary overflow-y-auto rounded-inherit">
            {rawContent.map((msg, index) => (
                <MessageRenderer key={index} msg={msg} index={index} />
            ))}
        </div>
    );
});

Preview.displayName = 'Preview';

export default Preview;
