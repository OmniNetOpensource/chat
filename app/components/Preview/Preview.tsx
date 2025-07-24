
"use client";

import useRenderContent from "./hooks/useRenderContent";
import { useEffect, forwardRef, useRef, useImperativeHandle } from 'react';
import './Preview.css';
import 'katex/dist/katex.min.css'

interface PreviewProps {
    rawContent:string;
}


const Preview =forwardRef<HTMLDivElement, PreviewProps>(({rawContent},parentRef) => {
    
    const localRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(parentRef,()=>localRef.current!,[]);

    const renderHtml = useRenderContent(rawContent);

    useEffect(()=>{
        const handleclick = (event:MouseEvent)=>{
            const target = event.target as HTMLElement;
            if(target.classList.contains('copy-button')){
                if(target.textContent!=='copy'){
                    return;
                }

                const codeToCopy = target.dataset.rawCode??'';
                navigator.clipboard.writeText(codeToCopy).then(()=>{
                    target.textContent = '√ copied';
                    setTimeout(()=>{
                    target.textContent='copy';
                    },1000);
                }).catch(err =>{
                    console.error('无法复制到剪切板', err);
                })
            }
        }

        const previewElement = localRef.current;
        if(previewElement){
            previewElement.addEventListener('click',handleclick);
        }
        
        return ()=>{
            if(previewElement){
            previewElement.removeEventListener('click',handleclick);
            }
        }
    },[]);


    return (
        <div ref={localRef} className="h-full w-full p-4 bg-secondary text-text-primary overflow-y-auto">
            <div className="preview-content show-area" dangerouslySetInnerHTML={{__html:renderHtml}} />
        </div>
    );
});

export default Preview;
