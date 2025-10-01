"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import NewChatIcon from "../Icons/NewChatIcon";
import { useSidebarState } from "@/app/lib/store/useSidebarState";
import { useResponsive } from "@/app/lib/hooks/useResponsive";
import { useChatStore } from "@/app/lib/store/useChatStore";

import SidebarButton from "./SidebarButton";
import ConversationHistory from "./ConversationHistory";

interface SidebarOverlayProps {
  isVisible: boolean;
  onClick: () => void;
}

const SidebarOverlay = ({ isVisible, onClick }: SidebarOverlayProps) => {
  if (!isVisible) return null;

  return (
    <div
      className="fixed top-0 left-0 w-full h-full bg-gray-50/50 dark:bg-black/50 z-[30]"
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
    className={`absolute top-1.5 z-[49]
      flex flex-col justify-center items-center
      cursor-pointer
      bg-transparent hover:bg-hoverbg
      w-[32px] h-[32px] rounded-md
      border-none
      transition-all duration-300 ease-in-out
      ${
        isMobile
          ? isSidebarOpen
            ? "left-[150px]"
            : "left-[1rem]"
          : isSidebarOpen
            ? "left-[184px]"
            : "left-[0.75rem]"
      }
    `}
  >
    <span
      className={`w-[24px] h-[3px] bg-text-primary my-[2px] rounded-[2px] 
        transition-all duration-300 ease-in-out
        ${isSidebarOpen ? "rotate-45 translate-x-1 translate-y-1.5" : ""}
      `}
    />
    <span
      className={`w-[24px] h-[3px] bg-text-primary my-[2px] rounded-[2px]
        transition-all duration-300 ease-in-out
        ${isSidebarOpen ? "opacity-0" : ""}
      `}
    />
    <span
      className={`w-[24px] h-[3px] bg-text-primary my-[2px] rounded-[2px]
        transition-all duration-300 ease-in-out
        ${isSidebarOpen ? "-rotate-45 translate-x-1.5 -translate-y-1.5" : ""}
      `}
    />
  </button>
);

interface SidebarLogoProps {
  isSidebarOpen: boolean;
  onClick: () => void;
}

const SidebarLogo = ({ isSidebarOpen, onClick }: SidebarLogoProps) => (
  <div className="w-fit mt-1 ml-1 mb-5">
    <button
      onClick={onClick}
      className={`cursor-pointer w-[38px] h-[38px] hover:bg-hoverbg p-1 rounded-md
        flex flex-col justify-center items-center
        ${!isSidebarOpen ? "pointer-events-none opacity-0" : ""}
        transition-all duration-300 ease-in-out`}
    >
      <span>
        <Image src="/chat.png" alt="logo" width={35} height={35} />
      </span>
    </button>
  </div>
);

interface SidebarChromeProps {
  isSidebarOpen: boolean;
  isMobile: boolean;
  children: ReactNode;
}

const SidebarChrome = ({ isSidebarOpen, isMobile, children }: SidebarChromeProps) => (
  <div
    className={`text-text-primary h-full 
        flex flex-col items-start 
        gap-4 z-[48]
        transition-all duration-300 ease-in-out
        ${
          isMobile
            ? isSidebarOpen
              ? "fixed left-0 top-0 w-[200px] opacity-100 border-r-[1px] border-gray-200 dark:border-gray-700 px-1 bg-sidebar"
              : "w-0 opacity-0 pointer-events-none border-r-0 px-0 bg-sidebar"
            : isSidebarOpen
              ? "w-[240px] opacity-100 border-r-[1px] border-gray-200 dark:border-gray-700 px-1 bg-sidebar"
              : "w-[60px] border-r-[1px] border-gray-200 dark:border-gray-700 px-1 bg-chat-background"
        }`}
  >
    {children}
  </div>
);

const Sidebar = () => {
  const { clear } = useChatStore();
  const { isSidebarOpen, setSidebar } = useSidebarState();
  const { isMobile } = useResponsive();
  const router = useRouter();

  const handleToggleSidebar = () => {
    setSidebar();
  };

  const handleGoToHome = () => {
    if (!isSidebarOpen) {
      // Future implementation placeholder
    }
    router.push("/", { scroll: false });
  };

  return (
    <>
      <SidebarOverlay isVisible={isMobile && isSidebarOpen} onClick={handleToggleSidebar} />
      <SidebarToggle isSidebarOpen={isSidebarOpen} isMobile={isMobile} onClick={handleToggleSidebar} />

      <SidebarChrome isSidebarOpen={isSidebarOpen} isMobile={isMobile}>
        <SidebarLogo isSidebarOpen={isSidebarOpen} onClick={handleGoToHome} />

        <SidebarButton
          onClick={() => {
            router.push("/", { scroll: false });
            clear();
          }}
          icon={<NewChatIcon className="w-8 h-8" />}
          text="New Chat"
        />

        {isSidebarOpen && <ConversationHistory />}
      </SidebarChrome>
    </>
  );
};

export default Sidebar;
