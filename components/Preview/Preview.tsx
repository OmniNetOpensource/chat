'use client';

import { useState, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import 'katex/dist/katex.min.css';
import { useChatStore } from '@/lib/store/useChatStore';
import { type MessageBlock } from '@/lib/types';
import SlideLight from '../SlideLight/SlideLight';
import ImageViewer from '../ImageViewer/ImageViewer';
import FileViewer from '../FileViewer/FileViewer';

interface PreviewProps {
  rawContent: MessageBlock[];
}

const MessageRenderer = memo(({ msg }: { msg: MessageBlock }) => {
  const [isExpand, setIsExpand] = useState<boolean>(false);
  const { status } = useChatStore();

  const contentText = 'text' in msg ? msg.text : '';
  const processedText = contentText.replace(/(\$\$[\s\S]*?\$\$)/g, '\n$1\n');

  if (msg.type === 'text') {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
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
          {!msg.finished ? (
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
            rehypePlugins={[rehypeKatex]}
          >
            {processedText}
          </ReactMarkdown>
        </div>
      </div>
    );
  }

  if (msg.type === 'websearch') {
    return (
      <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
        <div className="font-medium text-foreground/80">Web result</div>
        {msg.title ? <div className="mt-1 font-semibold">{msg.title}</div> : null}
        {msg.url ? (
          <a
            href={msg.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block break-words text-primary underline"
          >
            {msg.url}
          </a>
        ) : null}
        {msg.content ? (
          <p className="mt-1 whitespace-pre-wrap text-xs text-foreground/70">{msg.content}</p>
        ) : null}
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
        return msg.type === 'text' || msg.type === 'thinking' || msg.type === 'websearch' ? (
          <MessageRenderer
            key={index}
            msg={msg}
          />
        ) : msg.type === 'image' ? (
          <ImageViewer
            imageUrl={msg.base64}
            key={index}
          />
        ) : msg.type === 'file' ? (
          <FileViewer key={index} />
        ) : null;
      })}
    </div>
  );
};

Preview.displayName = 'Preview';

export default Preview;
