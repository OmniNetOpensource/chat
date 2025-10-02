'use client';

import { useParams } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
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
  }, [conversationId]);

  return (
    <div className="flex h-screen w-screen flex-row">
      <Sidebar />
      <Main />
    </div>
  );
}