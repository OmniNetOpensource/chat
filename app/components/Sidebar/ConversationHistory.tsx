import { getAllConversations, type ConversationRecord } from '@/app/lib/services/indexedDBService'
import { useChatStore } from '@/app/lib/store/useChatStore';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVirtualizer } from '@tanstack/react-virtual';

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

  const handleLoadConversation = async (id: string) => {
    const conversationId = await loadConversation(id);
    if (conversationId) {
      router.push(`/c/${conversationId}`, { scroll: false });
    }
  };

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
              <div
                key={conversation.id}
                data-index={item.index}
                ref={virtualizer.measureElement}
                className="h-fit w-full py-2 hover:bg-hoverbg rounded-xl flex flex-col items-center justify-center cursor-pointer"
                onClick={() => handleLoadConversation(conversation.id)}
              >
                <span className="">{conversation.title}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ConversationHistory;