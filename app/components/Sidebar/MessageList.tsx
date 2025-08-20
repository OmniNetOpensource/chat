'use client';
import { useState,useEffect } from "react";
import { useRouter } from "next/navigation";


interface ChatHistory{
    id:string,
    title:string,
}



const MessageList = () => {
    const router = useRouter();

    const [histories,setHistories] = useState<ChatHistory[]>([]);

    const fetchHistories = async () => {
        try{
            const res = await fetch('/api/chat-history');
            const data = await res.json();
    
            if(res.ok && Array.isArray(data)){
                setHistories([...histories,...data]);
            }else {
                console.log('error: ',data.error || '未知错误');
            }
        }catch(error){
            console.log('error');
        }

    }

    useEffect(()=>{
        fetchHistories();
    },[]);
    
    return (
        <div className="flex flex-col gap-2
                        mt-6 px-4
                        overflow-y-auto
                        h-full w-full">
            {histories.map((chat)=>{
                return (
                    <div key={chat.id} className="bg-transparent rounded-md
                                                w-full py-2 px-4
                                                hover:bg-hoverbg cursor-pointer"
                        onClick={()=>{
                            router.push(`/chat/${chat.id}`);
                        }}>
                        <p>{chat.title}</p>
                    </div>
                )
            })}
        </div>
    )
}

export default MessageList;