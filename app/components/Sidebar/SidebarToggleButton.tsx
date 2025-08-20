"use client";

import { useSidebarState } from "@/app/lib/store/useSidebarState";
import { useResponsive } from "@/app/lib/hooks/useResponsive";

interface SidebarToggleButtonProps {
  onClick: () => void;
}

const SidebarToggleButton: React.FC<SidebarToggleButtonProps> = ({ onClick }) => {
  const { isSidebarOpen } = useSidebarState();
  const { isMobile } = useResponsive();

  return (
    <button 
      onClick={onClick} 
      className={`absolute top-1.5 z-[49]
        flex flex-col justify-center items-center
        cursor-pointer
        bg-transparent hover:bg-hoverbg
        w-[32px] h-[32px] rounded-md
        border-none
        transition-all duration-300 ease-in-out
        ${isMobile
          ? (isSidebarOpen ? 'left-[150px]' : 'left-[1rem]')
          : (isSidebarOpen ? 'left-[184px]' : 'left-[0.75rem]')
        }
      `}
    >
      <span 
        className={`w-[24px] h-[3px] bg-text-primary my-[2px] rounded-[2px] 
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'rotate-45 translate-x-1 translate-y-1.5' : ''}`
        }
      />
      <span 
        className={`w-[24px] h-[3px] bg-text-primary my-[2px] rounded-[2px]
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'opacity-0' : ''}`
        }
      />
      <span 
        className={`w-[24px] h-[3px] bg-text-primary my-[2px] rounded-[2px]
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? '-rotate-45 translate-x-1.5 -translate-y-1.5' : ''}`
        }
      />
    </button>
  );
};

export default SidebarToggleButton;