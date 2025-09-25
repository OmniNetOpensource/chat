'use client';

import { useEffect, useState } from 'react';
import MoonIcon from '../Icons/MoonIcon';
import SunIcon from '../Icons/SunIcon';
import { useTheme } from 'next-themes';
import { useChatStore } from '@/app/lib/store/useChatStore';

type OpenRouterModelsResponse = {
  data: Array<{
    id: string;
    // 如果后面需要再用到，可以逐步把字段补全
    // name?: string;
    // context_length?: number;
    // pricing?: { prompt?: number; completion?: number };
  }>;
};

const Header = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { model, setModel } = useChatStore();
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showSelector, setShowSelector] = useState<boolean>(false);

  const handleToggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };
  const handleModelSelectorClick = () => {
    setShowSelector(!showSelector);
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/models', { cache: 'no-cache' });
        if (!res.ok) {
          setError(`HTTP ${res.status}`);
          throw new Error(`HTTP ${res.status}`);
        }
        const json: OpenRouterModelsResponse = await res.json();

        const ids = (json?.data ?? []).map((m) => m.id);
        setAvailableModels(ids);
      } catch (e: any) {
        setError(e.message || 'failed to load models');
      } finally {
        setLoading(false);
      }
    })();
    setMounted(true);
    const currentModel = localStorage.getItem('model');
    if (currentModel) {
      setModel(currentModel);
    }
  }, []);

  const handleModelSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setModel(value);
    localStorage.setItem('model', value);
  };

  return (
    <div
      className="h-[48px] shadow-[0_2px_6px_0_rgba(0,0,0,0.04)]
                        flex flex-row justify-between items-center
                        py-[3px]
                        px-4"
    >
      <div className="relative h-fit w-fit ">
        {error ? (
          <span className="text-red-500">error</span>
        ) : loading ? (
          <span className="">loading...</span>
        ) : (
          <select
            id="modelSelect"
            value={model}
            onChange={handleModelSelect}
            className="hover:bg-hoverbg px-4 py-2 rounded-xl
            appearance-none cursor-pointer bg-chat-background text-text-primary"
          >
            {availableModels.map((model) => (
              <option
                key={model}
                value={model}
              >
                {model}
              </option>
            ))}
          </select>
        )}
      </div>
      <button
        onClick={handleToggleTheme}
        className="cursor-pointer
                            hover:bg-hoverbg
                            rounded-md
                            w-[40px] h-[40px]
                            flex justify-center items-center"
      >
        {mounted === true && theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </button>
    </div>
  );
};

export default Header;
