import { getAllConversations, type ConversationRecord } from '@/app/lib/services/indexedDBService'
import { useChatStore } from '@/app/lib/store/useChatStore';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const ConversationHistory = () => {
    const [conversationHistories, setConversationHistories] = useState<ConversationRecord[]>([]);
    const {loadConversation, status} = useChatStore();
    const router = useRouter();

    useEffect(()=>{
        const loadConversationsHistories = async ()=>{
            const latestConversations = await getAllConversations();
            setConversationHistories(latestConversations);
        }
        
        loadConversationsHistories();
    },[status]);

    const handleLoadConversation = async (id: string) => {
        const conversationId = await loadConversation(id);
        if (conversationId) {
            router.push(`/c/${conversationId}`);
        }
    };

    return (
      <div
        className="flex flex-col items-center justify-start h-fit max-h-[100%] w-full gap-2
      overflow-y-auto"
      >
        {conversationHistories.map((conv) => {
          return (
            <span
              className="cursor-pointer hover:bg-hoverbg px-4 py-2 rounded-2xl"
              key={conv.id}
              onClick={() => handleLoadConversation(conv.id)}
            >
              {conv.title}
            </span>
          );
        })}
      </div>
    );
}

export default ConversationHistory;