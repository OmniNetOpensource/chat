'use client';

import Link from 'next/link';
import { SquarePen } from 'lucide-react';
import { useResponsive } from '@/lib/hooks/useResponsive';
import SlideLight from '@/components/SlideLight/SlideLight';
import { useChatStore } from '@/lib/store/useChatStore';

const Header = () => {
  const { isMobile } = useResponsive();
  const { conversationTitle } = useChatStore();

  return (
    <div
      className="h-[48px] shadow-[0_2px_6px_0_rgba(0,0,0,0.04)]
                        flex flex-row justify-between items-center
                        py-[3px]
                        px-4"
    >
      <div className={`flex-1 flex items-center ${isMobile ? 'justify-center' : 'justify-start'}`}>
        {/* ... existing code ... */}
      </div>
      <Link
        href="/"
        className="cursor-pointer
                            hover:bg-hoverbg
                            rounded-md
                            w-[40px] h-[40px]
                            flex justify-center items-center"
        aria-label="New chat"
      >
        <SquarePen
          width={24}
          height={24}
        />
      </Link>
    </div>
  );
};

export default Header;
