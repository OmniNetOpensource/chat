"use client";

import Image from "next/image";
import { useSidebarState } from "@/app/lib/store/useSidebarState";

interface SidebarLogoProps {
  onClick: () => void;
}

const SidebarLogo: React.FC<SidebarLogoProps> = ({ onClick }) => {
  const { isSidebarOpen } = useSidebarState();
  
  return (
    <div className="w-fit mt-1 ml-1 mb-5">
      <button 
        onClick={onClick} 
        className={`cursor-pointer w-[38px] h-[38px] hover:bg-hoverbg p-1 rounded-md
          flex flex-col justify-center items-center
          ${!isSidebarOpen && 'pointer-events-none opacity-0'}
          transition-all duration-300 ease-in-out`
        }
      >
        <span>
          <Image src="/chat.png" alt="logo" width={35} height={35} />
        </span>
      </button>
    </div>
  );
};

export default SidebarLogo;