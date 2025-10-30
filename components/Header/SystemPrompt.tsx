import { useEffect, useState } from 'react';
import SystemPromptIcon from '../Icons/SystemPromptIcon'; // 1. 导入新图标
import { useChatStore } from '@/lib/store/useChatStore';
const SystemPrompt = () => {
  const [promptEditing, setPromptEditing] = useState(false);
  const { systemPrompt, setSystemPrompt } = useChatStore();
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSystemPrompt(e.target.value);
  };

  useEffect(() => {
    const savedSystemPrompt = localStorage.getItem('systemprompt') || '';
    setSystemPrompt(savedSystemPrompt);
  }, []);

  useEffect(() => {
    localStorage.setItem('systemprompt', systemPrompt);
    setSystemPrompt(systemPrompt);
  }, [systemPrompt]);

  return (
    <>
      {/* 2. 给按钮添加样式 */}
      <button
        onClick={() => setPromptEditing(!promptEditing)}
        className="cursor-pointer hover:bg-hoverbg rounded-md w-[40px] h-[40px] flex justify-center items-center"
      >
        {/* 3. 使用图标并给它指定大小 */}
        <SystemPromptIcon className="w-5 h-5" />
      </button>
      {promptEditing && (
        <>
          <div
            onClick={() => setPromptEditing(!promptEditing)}
            className="z-overlay fixed top-0 left-0 w-full h-full bg-black/50"
          />
          <div className="z-modal fixed w-1/2 h-1/2 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-secondary rounded-lg shadow-lg p-4 text-text-primary">
            <textarea
              value={systemPrompt}
              onChange={handlePromptChange}
              className="resize-none w-full h-full outline-0"
              placeholder="write your prompt here..."
            ></textarea>
          </div>
        </>
      )}
    </>
  );
};

export default SystemPrompt;
