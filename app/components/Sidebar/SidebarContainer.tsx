"use client";

import { ReactNode } from "react";
import { useSidebarState } from "@/app/lib/store/useSidebarState";
import { useResponsive } from "@/app/lib/hooks/useResponsive";

interface SidebarContainerProps {
  children: ReactNode;
}

const SidebarContainer: React.FC<SidebarContainerProps> = ({ children }) => {
  const { isSidebarOpen } = useSidebarState();
  const { isMobile } = useResponsive();
  
  return (
    <div 
      className={`text-text-primary h-full 
        flex flex-col items-start 
        gap-4 z-[48]
        transition-all duration-300 ease-in-out
        
        ${isMobile
          ? (isSidebarOpen
            ? 'fixed left-0 top-0 w-[200px] opacity-100 border-r-[1px] border-gray-200 dark:border-gray-700 px-1 bg-sidebar'
            : 'w-0 opacity-0 pointer-events-none border-r-0 px-0 bg-sidebar')
          : (isSidebarOpen
            ? 'w-[240px] opacity-100 border-r-[1px] border-gray-200 dark:border-gray-700 px-1 bg-sidebar'
            : 'w-[60px] border-r-[1px] border-gray-200 dark:border-gray-700 px-1 bg-chat-background')
        }`
      }
    >
      {children}
    </div>
  );
};

export default SidebarContainer;