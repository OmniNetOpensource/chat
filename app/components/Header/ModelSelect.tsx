'use client';

import { useEffect, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useChatStore } from '@/app/lib/store/useChatStore';

type OpenRouterModelsResponse = {
  data: Array<{ id: string }>;
};

const ModelList = ({ models, onSelect }: { models: string[]; onSelect: (id: string) => void }) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const [currentModels, setCurrentModels] = useState<string[]>(models);
  const [searchText, setSearchText] = useState<string>('');
  const virtualizer = useVirtualizer({
    count: currentModels.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 45,
    overscan: 8,
  });

  const items = virtualizer.getVirtualItems();

  const handleSearchInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);
    const filtered = models.filter((model) => model.toLowerCase().includes(value));
    setCurrentModels(filtered);
  };

  const highlightSearchText = (text: string, searchText: string) => {
    if (!searchText.trim()) {
      return text;
    }

    const regex = new RegExp(`(${searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');

    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (part.toLowerCase() === searchText.toLowerCase()) {
        return (
          <span
            key={index}
            className="bg-yellow-200 dark:bg-yellow-800 font-medium"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };
  return (
    <>
      <div className="h-10 rounded-t-xl bg-popover">
        <textarea
          value={searchText}
          className="resize-none w-full h-full px-3 pt-1.5 focus:outline-none focus:ring-0"
          placeholder="search models"
          onChange={handleSearchInput}
        ></textarea>
      </div>
      <div
        ref={parentRef}
        style={{ height: 300, width: 300, overflowY: 'auto', contain: 'strict' }}
        className="rounded-b-xl bg-popover shadow-md"
      >
        <div
          style={{
            height: virtualizer.getTotalSize(),
            width: '100%',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${items[0]?.start ?? 0}px)`,
            }}
          >
            {items.map((vr) => (
              <button
                key={vr.key}
                data-index={vr.index}
                ref={virtualizer.measureElement}
                onClick={() => onSelect(currentModels[vr.index])}
                className="block w-full text-left px-3 py-2 hover:bg-hoverbg focus:bg-hoverbg"
              >
                {highlightSearchText(currentModels[vr.index], searchText)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default function ModelSelect() {
  const { model, setModel } = useChatStore();
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
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
    setLoading(true);
    setError('');
    (async () => {
      try {
        const res = await fetch('/api/models', { cache: 'no-cache' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: OpenRouterModelsResponse = await res.json();
        setAvailableModels((json?.data ?? []).map((m) => m.id));
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'failed to load models';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    })();
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
          className="absolute top-[100%] left-0 z-dropdown mt-2"
          style={{ visibility: showSelector ? 'visible' : 'hidden' }}
        >
          {error ? (
            <div className="bg-secondary text-red-500">error</div>
          ) : loading ? (
            <div className="bg-secondary">loading...</div>
          ) : (
            <ModelList
              models={availableModels}
              onSelect={onPick}
            />
          )}
        </div>
      </div>
    </div>
  );
}
