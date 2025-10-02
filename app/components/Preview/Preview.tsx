'use client';

import { useState, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
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
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
      >
        {processedText}
      </ReactMarkdown>
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
          className={`text-sm opacity-50 ${isExpand ? 'h-fit max-h-80 overflow-y-auto ' : 'max-h-0 overflow-y-hidden'}`}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeRaw, rehypeKatex]}
          >
            {processedText}
          </ReactMarkdown>
        </div>
      </div>
    );
  }

  return null;
});

MessageRenderer.displayName = 'MessageRenderer';

const Preview = ({ rawContent }: PreviewProps) => {
  return (
    <div className="prose dark:prose-invert">
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
};

Preview.displayName = 'Preview';

export default Preview;
