'use client';

import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/app/lib/store/useChatStore';
import { useVirtualizer } from '@tanstack/react-virtual';

type OpenRouterModelsResponse = {
  data: Array<{
    id: string;
    // If we need more fields later, they can be added incrementally.
    // name?: string;
    // context_length?: number;
    // pricing?: { prompt?: number; completion?: number };
  }>;
};

const ModelSelect = () => {
  const { model, setModel } = useChatStore();
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showSelector, setShowSelector] = useState<boolean>(false);
  const parentRef = useRef(null);

  const handleModelSelectorClick = () => {
    setShowSelector((prev) => !prev);
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

    const currentModel = localStorage.getItem('model');
    if (currentModel) {
      setModel(currentModel);
    }
  }, [setModel]);

  const virtualizer = useVirtualizer({
    count: availableModels.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 45,
  });

  const items = virtualizer.getVirtualItems();

  return (
    <div className="relative h-fit w-fit ">
      {error ? (
        <span className="text-red-500">error</span>
      ) : loading ? (
        <span className="">loading...</span>
      ) : (
        <button
          onClick={handleModelSelectorClick}
          className="cursor-pointer  hover:bg-hoverbg px-4 py-2 rounded-xl relative"
        >
          <span>{model}</span>
          {showSelector && (
            <div
              className="absolute top-[100%]"
              ref={parentRef}
              style={{ height: 400, width: 400, overflowY: 'auto' }}
            >
              <div
                style={{ height: virtualizer.getTotalSize() }}
                className="top-0 left-0 w-full"
              >
                <div
                  style={{ transform: `translateY(${items[0]?.start ?? 0}px)` }}
                  className="absolute top-0 left-0 w-full"
                >
                  {items.map((virtualRow) => (
                    <div
                      key={virtualRow.key}
                      data-index={virtualRow.index}
                      ref={virtualizer.measureElement}
                    >
                      {availableModels[virtualRow.index]}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </button>
      )}
    </div>
  );
};

export default ModelSelect;
