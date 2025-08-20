"use client";

import { useRouter } from "next/navigation";
import NewChatIcon from "../Icons/NewChatIcon";
import SearchIcon from "../Icons/SearchIcon";
import { useSidebarState } from "@/app/lib/store/useSidebarState";
import { useResponsive } from "@/app/lib/hooks/useResponsive";
import SidebarToggleButton from "./SidebarToggleButton";
import SidebarLogo from "./SidebarLogo";
import SidebarButton from "./SidebarButton";
import SidebarContainer from "./SidebarContainer";
import SidebarOverlay from "./SidebarOverlay";


import MessageList from "./MessageList";
import { useChatStore } from "@/app/lib/store/useChatStore";


const Sidebar: React.FC = () => {
    const { isSidebarOpen, setSidebar } = useSidebarState();
    const { isMobile } = useResponsive();
    const router = useRouter();
    const {clear} = useChatStore();
    
    const handleSearchClick = () => {
        // Future implementation
    }

    const handleSidebarClick = () => {
        setSidebar();
    }

    const handleGoToHome = () => {
        if (!isSidebarOpen) {
            // Future implementation
        }
        router.push('/');
    }

    return (  
        <>
            <SidebarOverlay 
                isVisible={isMobile && isSidebarOpen}
                onClick={handleSidebarClick}
            />
            
            <SidebarToggleButton onClick={handleSidebarClick} />
            {isSidebarOpen&&isMobile&&<div className="absolute top-0 left-0 w-full h-full bg-black/50 z-[30]" onClick={handleSidebarClick}></div>}
            
            <SidebarContainer>
                <SidebarLogo onClick={handleGoToHome} />
                
                <SidebarButton 
                    onClick={()=>{
                        clear();
                    }}
                    icon={<NewChatIcon className="w-8 h-8" />}
                    text="New Chat"
                />
                
{/*                 <SidebarButton 
                    onClick={handleSearchClick}
                    icon={<SearchIcon className="w-8 h-8" />}
                    text="Search"
                    textClassName="text-text-primary"
                /> */}

                
                {isSidebarOpen&&<MessageList/>}
            </SidebarContainer>
        </>
    );
}

export default Sidebar;