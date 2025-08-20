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
import { useSession } from "next-auth/react";
import DefaultAvatar from "../Icons/DefaultAvatar";
import { useState } from "react";
import UserModal from "../UserModal/UserModal";
import MessageList from "./MessageList";
import { useChatStore } from "@/app/lib/store/useChatStore";


const Sidebar: React.FC = () => {
    const { isSidebarOpen, setSidebar } = useSidebarState();
    const { isMobile } = useResponsive();
    const router = useRouter();
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
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

    const {data:session} = useSession();

    const handleUserClick = () => {
        setIsUserModalOpen(true);
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

{/*                 <SidebarButton 
                    onClick={handleUserClick}
                    icon={session?.user?.image 
                        ? <img src={session.user.image} alt="User" className="w-8 h-8 rounded-full" />
                        : <DefaultAvatar 
                            width={32} 
                            height={32} 
                            initials={session?.user?.name?.substring(0, 2) || "U"} 
                          />
                    }
                    text={session?.user?.name||'User'}
                    textClassName="text-text-primary"
                    className="mt-auto mb-2"
                /> */}
            </SidebarContainer>
    {/*         {isUserModalOpen&&<UserModal onClick={()=>setIsUserModalOpen(false)}/>} */}
        </>
    );
}

export default Sidebar;