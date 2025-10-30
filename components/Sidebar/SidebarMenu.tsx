'use client';

import { useRouter } from 'next/navigation';
import { useSidebarState } from '@/lib/store/useSidebarState';
import { useChatStore } from '@/lib/store/useChatStore';
import { SquarePen } from 'lucide-react';

const SidebarMenu = () => {
  const router = useRouter();
  const { isSidebarOpen } = useSidebarState();
  const clearChat = useChatStore((state) => state.clear);
  const handleNewChat = () => {
    clearChat();
    router.push('/');
  };
  return (
    <div className="w-full flex flex-col gap-1 items-start mb-3 ">
      <button
        type="button"
        onClick={handleNewChat}
        className="w-full hover:bg-hoverbg bg-transparent gap-2 rounded-md whitespace-nowrap overflow-hidden px-2 py-1
        flex flex-row items-center justify-start
        transition-all duration-300 ease-in-out "
        aria-label="Start new chat"
      >
        <SquarePen
          className="flex-shrink-0"
          width={20}
          height={20}
        />
        <span
          className={`
          ${isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}
        >
          New Chat
        </span>
      </button>
    </div>
  );
};
export default SidebarMenu;
