'use client';
import React, { useState, type ChangeEvent, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useResponsive } from '@/app/lib/hooks/useResponsive';
import { useFileUpload } from '@/app/lib/hooks/useFileUpload';
import { useChatStore } from '@/app/lib/store/useChatStore';
import { type MessageBlock, type UserMessage } from '@/app/lib/types';
import CloseIcon from '../Icons/CloseIcon';
import AttachIcon from '../Icons/AttachIcon';
import LoadingIcon from '../Icons/LoadingIcon';
import UpArrowIcon from '../Icons/UpArrowIcon';
import ImageViewer from '../ImageViewer/ImageViewer';
import FileViewer from '../FileViewer/FileViewer';

interface ChatInputProps {
  index: number;
  editing?: boolean;
  onFinishEdit?: () => void;
}

const ChatInput = ({ index, editing, onFinishEdit }: ChatInputProps) => {
  const { messages, status, sendMessage, stop, setCurrentConversationId, currentConversationId } =
    useChatStore();
  const { files, removeFiles, addFilesFromInput, addFilesFromPaste, clearFiles } = useFileUpload({
    initialFiles: messages[index]?.content.filter(
      (msg) => msg.type === 'file' || msg.type === 'image',
    ),
  });
  const router = useRouter();
  const { isMobile } = useResponsive();

  const [text, setText] = useState<string>(
    messages[index]?.content.filter((msg) => msg.type === 'text').join(''),
  );
  const [canClick, setCanClick] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    setCanClick(text.trim().length > 0 || files.length > 0 || status === 'streaming');
  }, [text, files.length, status]);

  const fileUploadRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!text.trim() && files.length === 0) {
      return;
    }

    const contentToSend: MessageBlock[] = [...files];

    if (text) {
      contentToSend.push({ type: 'text', text, id: crypto.randomUUID() });
    }
    setText('');
    clearFiles();
    if (editing && onFinishEdit) {
      onFinishEdit();
    }

    if (!currentConversationId) {
      // 新会话：生成ID并立即跳转
      const newConversationId = crypto.randomUUID();
      setCurrentConversationId(newConversationId);
      router.push(`/c/${newConversationId}`);
    }

    // 开始发送消息（不等待完成）
    const userMessage: UserMessage = {
      role: 'user',
      content: contentToSend,
    };
    sendMessage(index, userMessage);
  };
  const handleTextAreaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleFileUploadClick = () => {
    fileUploadRef.current?.click();
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }
    const maxLines = isMobile ? 5 : 7;
    const lineHeight = 24;
    const maxHeight = lineHeight * maxLines;
    textarea.style.height = '0px';
    const scrollHeight = textarea.scrollHeight;
    textarea.style.height = `${Math.min(maxHeight, scrollHeight)}px`;
  }, [text, isMobile]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.files;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.type.startsWith('image/') || item.type === 'application/pdf') {
        addFilesFromPaste(item);
      }
    }
  };

  return (
    <div
      className={`${editing ? 'relative' : 'absolute bottom-1.5 left-1/2 transform -translate-x-1/2'}
      ${isMobile ? 'w-[95%]' : 'w-[60%]'}
      ${isMobile ? 'px-1.5 py-1.5' : 'px-2 py-2'}
    bg-secondary flex flex-col gap-0 border-none
    transition-all duration-700 ease-in-out`}
    >
      {files.length > 0 && (
        <div className="flex flex-row gap-1 w-full h-fit m-0 p-0">
          {files.map((file) => {
            const isImage = file.type === 'image';
            return (
              <div
                key={file.id}
                className="relative"
              >
                {isImage ? (
                  <ImageViewer imageUrl={file.base64} />
                ) : (
                  <FileViewer fileName="PDF attachment" />
                )}
                <button
                  onClick={() => removeFiles(file.id)}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
                >
                  <CloseIcon
                    width={10}
                    height={10}
                  />
                </button>
              </div>
            );
          })}
        </div>
      )}
      <textarea
        ref={textareaRef}
        className="bg-transparent w-full text-sm overflow-y-auto focus:outline-none focus:border-none resize-none pl-1.5 mb-3"
        placeholder="prompt in , everything out"
        value={text}
        onChange={handleTextAreaChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        style={{ height: '24px' }}
      />
      <div className="my-0 mx-0 w-full h-[32px] flex flex-row gap-1 justify-between items-center">
        <button
          onClick={handleFileUploadClick}
          className={`cursor-pointer p-1 rounded-md hover:bg-hoverbg transition-colors`}
        >
          <AttachIcon
            width={20}
            height={20}
          />
        </button>
        <input
          ref={fileUploadRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={addFilesFromInput}
        />
        <button
          className={`bg-primary ${
            canClick ? 'cursor-pointer opacity-100' : 'cursor-not-allowed opacity-10'
          } rounded-md py-1 px-[5px] text-secondary transition-opacity`}
          onClick={status === 'streaming' ? stop : handleSend}
          disabled={!canClick}
        >
          {status === 'streaming' ? (
            <LoadingIcon
              width={20}
              height={20}
            />
          ) : (
            <UpArrowIcon
              width={20}
              height={20}
            />
          )}
        </button>
      </div>
    </div>
  );
};
export default ChatInput;
