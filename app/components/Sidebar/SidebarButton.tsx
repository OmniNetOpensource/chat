"use client";

import { useSidebarState } from "@/app/lib/store/useSidebarState";
import { ReactNode } from "react";

interface SidebarButtonProps {
  onClick: () => void;
  icon: ReactNode;
  text: string;
  textClassName?: string;
  className?: string;
}

const SidebarButton: React.FC<SidebarButtonProps> = ({ 
  onClick, 
  icon, 
  text,
  textClassName = "text-primary",
  className = ""
}) => {
  const { isSidebarOpen } = useSidebarState();
  
  return (
    <button 
      onClick={onClick} 
      className={`cursor-pointer
        w-full h-9 
        flex flex-row items-center 
        px-2
        hover:bg-hoverbg
        rounded-md
        ${className}`
      }
    >
      <div className="w-8 h-8 flex-none">
        {icon}
      </div>
      {isSidebarOpen && (
        <span className={`flex-1 text-sm font-medium ${textClassName}
          overflow-hidden
          whitespace-nowrap
          ml-1`
        }>
          {text}
        </span>
      )}
    </button>
  );
};

export default SidebarButton;