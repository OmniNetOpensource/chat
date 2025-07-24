"use client";

import Conversation from "../Conversation/Conversation";
import Header from "../Header/Header";
import type{ Messages } from "../../lib/types/messages";
import { useState } from "react";

const Main:React.FC = ()=>{

    return (
        <div className="flex-1 bg-sidebar flex flex-col">
            <Header />
            <Conversation/>
        </div>
    );
}



export default Main;
