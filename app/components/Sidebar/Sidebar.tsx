

"use client";

import { useState } from "react";
import Button from "../Button/Button";
import ExpandSidebarIcon from "../Icons/ExpandSidebarIcon";
import CollapseSidebarIcon from "../Icons/CollapseSidebarIcon";
import NewChatIcon from "../Icons/NewChatIcon";
import SearchIcon from "../Icons/SearchIcon";
import { useHandleMessage } from "../../lib/store/handleMessages";


const Sidebar:React.FC= ()=>{
    const [isExpanded,setIsExpanded] = useState(false);

    const {clearMessage} = useHandleMessage();

    const handleToggleClick = () =>{
        setIsExpanded(!isExpanded);
    }

    const handleSearchClick = ()=>{

    }

    return (
        <div className={`bg-sidebar text-text-primary h-full flex flex-col items-center gap-2 py-4 ${isExpanded?'w-[240px]':'w-[48px]'} px-2 transition-all duration-100 ease-in-out border-r-1 border-gray-200`}>
            <Button content={isExpanded? <CollapseSidebarIcon  className="w-5 h-5"/>   :<ExpandSidebarIcon  className="w-5 h-5"/>} description={isExpanded?"收回侧边栏":"展开侧边栏"} onClick={handleToggleClick}/>
            <Button content={<NewChatIcon className="w-5 h-5"/>} description="new chat" onClick={clearMessage}/>
            <Button content={<SearchIcon  className="w-5 h-5"/>} description="search chat" onClick={handleSearchClick}/>
        </div>
    );
}

export default Sidebar;
