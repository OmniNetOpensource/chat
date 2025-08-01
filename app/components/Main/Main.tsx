"use client";

import Conversation from "../Conversation/Conversation";
import Header from "../Header/Header";


const Main:React.FC = ()=>{

    return (
        <div className="flex-1 bg-chat-background flex flex-col">
            <Header />
            <Conversation/>
        </div>
    );
}



export default Main;
