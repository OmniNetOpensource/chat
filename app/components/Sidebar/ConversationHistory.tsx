import { getAllConversations, type ConversationRecord } from '@/app/lib/services/indexedDBService';
import { useChatStore } from '@/app/lib/store/useChatStore';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVirtualizer } from '@tanstack/react-virtual';
import Link from 'next/link';

const ConversationHistory = () => {
  const [conversationHistories, setConversationHistories] = useState<ConversationRecord[]>([]);
  const { loadConversation, status } = useChatStore();
  const router = useRouter();
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: conversationHistories.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64,
  });
  const items = virtualizer.getVirtualItems();

  useEffect(() => {
    const loadConversationsHistories = async () => {
      const latestConversations = await getAllConversations();
      setConversationHistories(latestConversations);
    };

    loadConversationsHistories();
  }, [status]);

  return (
    <div
      ref={parentRef}
      className="flex flex-col items-center justify-start h-full w-full gap-2 px-2 overflow-y-auto"
      style={{ contain: 'strict' }}
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
          className="flex flex-col items-center gap-2"
        >
          {items.map((item) => {
            const conversation = conversationHistories[item.index];
            if (!conversation) {
              return null;
            }

            return (
              <Link
                href={`/c/${conversation.id}`}
                key={conversation.id}
                data-index={item.index}
                ref={virtualizer.measureElement}
                className="h-fit w-full py-2 px-3 hover:bg-hoverbg rounded-xl flex flex-col items-left justify-center cursor-pointer"
              >
                <span className="">{conversation.title}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ConversationHistory;
