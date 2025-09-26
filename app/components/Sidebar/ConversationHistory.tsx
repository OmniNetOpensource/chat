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
        className="flex flex-col items-center justify-start h-fit max-h-[100%] w-full gap-2 px-2
      overflow-y-auto"
      >
        {conversationHistories.map((conv) => {
          return (
            <div
              key={conv.id}
              className="h-fit w-full py-2 hover:bg-hoverbg rounded-xl flex flex-col items-center justify-center
              cursor-pointer
              "
              onClick={() => handleLoadConversation(conv.id)}
            >
              <span className="">{conv.title}</span>
            </div>
          );
        })}
      </div>
    );
}

export default ConversationHistory;