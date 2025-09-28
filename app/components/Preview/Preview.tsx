'use client';

import { useEffect, forwardRef, useRef, useImperativeHandle, useState, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import './Preview.css';
import 'katex/dist/katex.min.css';
import { type Content, useChatStore } from '@/app/lib/store/useChatStore';
import SlideLight from '../SlideLight/SlideLight';
import ImageViewer from '../ImageViewer/ImageViewer';

interface PreviewProps {
  rawContent: Content[];
}

const MessageRenderer = memo(({ msg }: { msg: Content }) => {
  const [isExpand, setIsExpand] = useState<boolean>(false);
  const { currentThinkingId, status } = useChatStore();

  const contentText = 'text' in msg ? msg.text : '';
  const processedText = contentText.replace(/(\$\$[\s\S]*?\$\$)/g, '\n$1\n');

  if (msg.type === 'text') {
    return (
      <div className="preview-content show-area">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeRaw, rehypeKatex]}
        >
          {processedText}
        </ReactMarkdown>
      </div>
    );
  }

  if (msg.type === 'thinking') {
    return (
      <div>
        <button
          onClick={() => {
            setIsExpand(!isExpand);
          }}
          className="cursor-pointer"
        >
          {msg.id === currentThinkingId && status === 'streaming' ? (
            <SlideLight text={`Thinking...`} />
          ) : (
            <span>Thought for {msg.time} s</span>
          )}
        </button>
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isExpand ? 'max-h-96' : 'max-h-0'
          } opacity-60 text-sm leading-tight overflow-y-auto`}
        >
          <div className="preview-content show-area p-2">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeRaw, rehypeKatex]}
            >
              {processedText}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }

  return null;
});

MessageRenderer.displayName = 'MessageRenderer';

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
        navigator.clipboard
          .writeText(codeToCopy)
          .then(() => {
            target.textContent = '√ copied';
            setTimeout(() => {
              target.textContent = 'copy';
            }, 1000);
          })
          .catch((err) => {
            console.error('无法复制到剪切板', err);
          });
      }
    };

    const previewElement = localRef.current;
    if (previewElement) {
      previewElement.addEventListener('click', handleclick);
    }

    return () => {
      if (previewElement) {
        previewElement.removeEventListener('click', handleclick);
      }
    };
  }, []);

  return (
    <div
      ref={localRef}
      className="h-fit w-full text-text-primary overflow-y-auto rounded-inherit"
    >
      {rawContent.map((msg, index) => {
        return msg.type === 'text' || msg.type === 'thinking' ? (
          <MessageRenderer
            key={index}
            msg={msg}
          />
        ) : msg.type === 'image_url' ? (
          <ImageViewer
            imageUrl={msg.image_url.url}
            key={index}
          />
        ) : null;
      })}
    </div>
  );
});

Preview.displayName = 'Preview';

export default Preview;
