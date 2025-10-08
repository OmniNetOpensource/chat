'use client';

import Link from 'next/link';
import NewChatIcon from '../Icons/NewChatIcon';
import { useSidebarState } from '@/app/lib/store/useSidebarState';

const SidebarMenu = () => {
  const { isSidebarOpen } = useSidebarState();

  return (
    <div className="w-full flex flex-col gap-1 items-start">
      <Link
        href={`/`}
        className="w-full hover:bg-hoverbg bg-transparent flex flex-row items-center gap-2 px-1 rounded-md"
      >
        <NewChatIcon
          className=""
          width={20}
          height={20}
        />
        <span
          className={`whitespace-nowrap transition-all duration-300 ease-in-out ${
            isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
          }`}
        >
          new chat
        </span>
      </Link>
    </div>
  );
};

export default SidebarMenu;
