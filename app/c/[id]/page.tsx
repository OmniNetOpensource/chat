'use client';

import { useParams } from 'next/navigation';
import Main from '@/app/components/Main/Main';
import { useChatStore } from '@/app/lib/store/useChatStore';
import { useEffect } from 'react';

export default function ChatPage() {
  const { loadConversation } = useChatStore();
  const params = useParams();
  const conversationId = params.id as string;

  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId);
    }
  }, [conversationId, loadConversation]);

  return <Main />;
}
