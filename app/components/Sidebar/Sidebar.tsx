'use client';

import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import { useSidebarState } from '@/app/lib/store/useSidebarState';
import { useResponsive } from '@/app/lib/hooks/useResponsive';

import ConversationHistory from './ConversationHistory';
import SidebarMenu from './SidebarMenu';
interface SidebarOverlayProps {
  onClick: (e: React.MouseEvent) => void;
}

const SidebarOverlay = ({ onClick }: SidebarOverlayProps) => {
  return (
    <div
      className="fixed top-0 left-0 w-full h-full bg-gray-50/50 dark:bg-black/50 z-sidebar-overlay"
      onClick={onClick}
    />
  );
};

interface SidebarToggleProps {
  isSidebarOpen: boolean;
  isMobile: boolean;
  onClick: () => void;
}

const SidebarToggle = ({ isSidebarOpen, isMobile, onClick }: SidebarToggleProps) => (
  <button
    onClick={onClick}
    className={`absolute top-1.5 ${isSidebarOpen ? (isMobile ? 'left-26' : 'left-30') : 'left-1.5'} 
      flex flex-col justify-center items-center
      cursor-pointer
      bg-transparent hover:bg-hoverbg
      w-[32px] h-[32px] rounded-md
      border-none
      transition-all duration-300 ease-in-out
      
      }
    `}
  >
    <span
      className={`w-[24px] h-[3px] bg-text-primary my-[2px] rounded-[2px] 
        transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'rotate-45 translate-x-1 translate-y-1.5' : ''}
      `}
    />
    <span
      className={`w-[24px] h-[3px] bg-text-primary my-[2px] rounded-[2px]
        transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'opacity-0' : ''}
      `}
    />
    <span
      className={`w-[24px] h-[3px] bg-text-primary my-[2px] rounded-[2px]
        transition-all duration-300 ease-in-out
        ${isSidebarOpen ? '-rotate-45 translate-x-1.5 -translate-y-1.5' : ''}
      `}
    />
  </button>
);

const Sidebar = () => {
  const { isSidebarOpen, setSidebar } = useSidebarState();
  const { isMobile } = useResponsive();
  const router = useRouter();

  const handleToggleSidebar = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSidebar();
    }
  };

  return (
    <>
      {isMobile && isSidebarOpen && <SidebarOverlay onClick={handleToggleSidebar} />}
      <div
        className={`${
          isMobile ? (isSidebarOpen ? 'w-36' : 'w-0') : isSidebarOpen ? 'w-40' : 'w-11'
        } relative transition-all duration-300
        z-sidebar flex flex-col gap-2 bg-sidebar`}
      >
        <SidebarToggle
          isSidebarOpen={isSidebarOpen}
          isMobile={isMobile}
          onClick={setSidebar}
        />
        <nav className="relative w-full px-1.5 flex flex-col gap-1 flex-1 min-h-0 mt-12">
          <SidebarMenu />
          {isSidebarOpen && <ConversationHistory />}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
