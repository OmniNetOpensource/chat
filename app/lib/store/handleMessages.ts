import { stat } from 'fs';
import {create} from 'zustand'


export interface message{
    content:string;
    type: 'user'|'assistant';
}

export interface MessageState{
    messages:message[];

    isLoading:boolean;

    clearMessage:() => void;

    sendMessage:(userInput:string) => Promise<void>;
}


export const useHandleMessage =create<MessageState> ( (set,get) =>({
    messages:[],
    isLoading:false,
    clearMessage: () => set({
        messages:[],
    }),

    sendMessage: async (userInput) => {

        set((state)=>({
            messages:[
                ...state.messages,
                {content:userInput,type:'user'}
            ],
            isLoading:true,
        }));


        try{
            const response = await fetch('/api/chat',{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({
                    messages: get().messages.map((msg)=>({
                        content:msg.content,
                        role:msg.type,
                    })),
                }),
            });

            if(!response.ok) throw new Error('API 调用失败');

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let aiResponse = '';
            let buffer = '';

            set((state)=>({
                messages:[
                    ...state.messages,
                    {content:'',type:'assistant'},
                ],
            }))
            
            while (true) {
                const { done, value } = await reader!.read();
                if (done) break;

                let answer = decoder.decode(value, { stream: true });
                console.log(answer);
                if(answer[0]==='0'||answer[0]==='f'){
                    if(answer[0]==='f'){
                        answer=answer.slice(47,-1);
                    }
                    let lines = answer.slice(3,-2).split('\\n');
                    for(let i=0; i<lines.length;i++){
                        aiResponse +=lines[i];
                        if(i!==lines.length-1){
                            aiResponse+='\n';
                        }
                        set((state) => ({
                            messages: [
                            ...state.messages.slice(0, -1),
                            { content: aiResponse, type: 'assistant' },
                            ],
                        }));
                    }
                }
            }
        }catch(error){
            console.error('发送消息失败:', error);
            set((state) => ({
                messages: [...state.messages, { 
                    content: '抱歉，发生了错误，请稍后重试。', 
                    type: 'assistant' 
                }]
            }));
        }finally{
            set({isLoading:false});
        }
    },
}));