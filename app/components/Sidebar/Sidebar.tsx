"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import NewChatIcon from "../Icons/NewChatIcon";
import SearchIcon from "../Icons/SearchIcon";
import { useMessageStore } from "@/app/lib/store/useMessageStore";
import { useSidebarState } from "@/app/lib/store/useSidebarState";
import { useResponsive } from "@/app/lib/hooks/useResponsive";

const Sidebar: React.FC = () => {
    const { clearMessage } = useMessageStore();
    const { isSidebarOpen, setSidebar } = useSidebarState();
    const { isMobile } = useResponsive();
    const router = useRouter();
    
    const handleSearchClick = () => {

    }


    const handleSidebarClick = () =>{
        setSidebar();
    }

    const handleGoToHome = () => {
        if(!isSidebarOpen){
        }
        router.push('/');
    }

    const handleBlankClick = () => {
        setSidebar();
    }

    return (  
        <>
            {isMobile && isSidebarOpen &&
                <div className="fixed top-0 left-0 w-full h-full bg-gray-50/50 dark:bg-black/50 z-[30]" onClick={handleBlankClick}>
                </div>
            }
            <button onClick={handleSidebarClick} className={`absolute top-1.5 z-[60]
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
                                                        `}>
                <span className={`w-[24px] h-[3px] bg-text-primary my-[2px] rounded-[2px] 
                                transition-all duration-300 ease-in-out
                                ${isSidebarOpen?'rotate-45 translate-x-1 translate-y-1.5':''}`}/>
                <span className={`w-[24px] h-[3px] bg-text-primary my-[2px] rounded-[2px]
                                transition-all duration-300 ease-in-out
                                ${isSidebarOpen?'opacity-0':''}`}/>
                <span className={`w-[24px] h-[3px] bg-text-primary my-[2px] rounded-[2px]
                                transition-all duration-300 ease-in-out
                                ${isSidebarOpen?'-rotate-45 translate-x-1.5 -translate-y-1.5':''}`}/>
            </button>
            
            <div className={`text-text-primary h-full 
                            flex flex-col items-start 
                            gap-4  z-50
                            transition-all duration-300 ease-in-out
                            relative
                            ${isMobile
                                ? (isSidebarOpen
                                    ? 'fixed left-0 top-0 w-[200px] opacity-100 border-r-[1px] border-gray-200 dark:border-gray-700 px-1 bg-sidebar '
                                    : 'w-0 opacity-0 pointer-events-none border-r-0 px-0 bg-sidebar')
                                : (isSidebarOpen
                                    ? 'w-[240px] opacity-100 border-r-[1px] border-gray-200 dark:border-gray-700 px-1 bg-sidebar'
                                    : 'w-[60px] border-r-[1px] border-gray-200 dark:border-gray-700 px-1 bg-chat-background')
                            }`}>
                <div className="w-fit mt-1 ml-1 mb-5">
                    <button onClick={handleGoToHome} className={`cursor-pointer w-[38px] h-[38px] hover:bg-hoverbg p-1 rounded-md
                                                                flex flex-col justify-center items-center
                                                                ${!isSidebarOpen && 'pointer-events-none opacity-0'}
                                                                transition-all duration-300 ease-in-out`}>
                        <span>
                            <Image src="/chat.png" alt="logo" width={35} height={35}/>
                        </span>
                    </button>
                </div>
                <button onClick={clearMessage} className={`cursor-pointer
                                                        w-full h-9 
                                                        flex flex-row items-center 
                                                        px-2
                                                        hover:bg-hoverbg
                                                        rounded-md`}>
                    <NewChatIcon className="w-8 h-8 flex-none"/>
                    {isSidebarOpen &&
                        <span className="flex-1 text-sm font-medium text-primary
                                        overflow-hidden
                                        whitespace-nowrap">
                            New Chat
                        </span>
                    }
                </button>
                <button onClick={handleSearchClick} className={`cursor-pointer
                                                        w-full h-9 
                                                        flex flex-row items-center 
                                                        px-2
                                                        hover:bg-hoverbg
                                                        rounded-md`}>
                    <SearchIcon className="w-8 h-8 flex-none"/>
                    {isSidebarOpen &&
                        <span className="flex-1 text-sm font-medium text-text-primary
                                        overflow-hidden
                                        whitespace-nowrap
                                        ml-1">
                            Search
                        </span>
                    }
                </button>

            </div>
        </>
    );
}

export default Sidebar;
