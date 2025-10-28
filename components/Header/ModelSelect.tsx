'use client';

import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/lib/store/useChatStore';

const AVAILABLE_MODELS: string[] = [
  'google/gemini-2.5-flash',
  'google/gemini-2.5-pro',
  'google/gemini-2.5-flash-lite',
];

export default function ModelSelect() {
  const { model, setModel } = useChatStore();
  const [showSelector, setShowSelector] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleModelSelectClick = () => {
    setShowSelector(!showSelector);
  };

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const currentModel = localStorage.getItem('model');
    if (currentModel) setModel(currentModel);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowSelector(false);
      }
    };

    if (showSelector) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSelector]);

  const onPick = (id: string) => {
    setModel(id);
    setShowSelector(false);
  };

  useEffect(() => {
    localStorage.setItem('model', model);
  }, [model]);

  return (
    <div className="relative h-fit w-fit">
      <div ref={dropdownRef}>
        <button
          onClick={handleModelSelectClick}
          className="cursor-pointer hover:bg-hoverbg px-4 py-2 rounded-xl"
        >
          <span>{model}</span>
        </button>

        <div
          className="absolute bottom-[100%] left-0 z-dropdown mb-2"
          style={{
            visibility: showSelector ? 'visible' : 'hidden',
            pointerEvents: showSelector ? 'auto' : 'none',
          }}
        >
          <div className="rounded-xl bg-popover shadow-md overflow-hidden">
            {AVAILABLE_MODELS.map((id) => (
              <button
                key={id}
                onClick={() => onPick(id)}
                className={`block w-full text-left px-3 py-2 hover:bg-hoverbg focus:bg-hoverbg ${
                  id === model ? 'font-semibold' : ''
                }`}
                aria-pressed={id === model}
              >
                {id}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
