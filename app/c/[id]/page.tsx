import ChatRoom from "./chatRoom";

export default async function ChatPage({params}: {params: {id: string}}){

    const fetchMessages = async ()=>{
        try{
            const res = await fetch(`/api/chat-history/${params.id}`)
            if(!res.ok){
                throw new Error('Failed to fetch messages')
            }
            const data = await res.json()
            return data.messages
        }catch(error){
            console.error(error);
            return [];
        }
    }

    const messages = await fetchMessages();

    return (
        <ChatRoom />
    )
}
