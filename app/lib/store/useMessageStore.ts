import {create} from 'zustand'


export interface message{
    content:string;
    type: 'user'|'assistant';
}

export interface MessageState{
    messages:message[];

    isLoading:boolean;

    clearMessage:() => void;

    abortController:AbortController | null;

    cancelResponse:() => void;

    sendMessage:(userInput:string) => Promise<void>;

    reSendMessage:(index:number) => Promise<void>;
}


export const useMessageStore =create<MessageState> ( (set,get) =>({
    messages:[],
    isLoading:false,
    clearMessage: () => set({
        messages:[],
    }),
    abortController:null,
    cancelResponse:() => {
        set({isLoading:false});
        const {abortController} = get();
        if(abortController){
            try {
                abortController.abort();
            } catch {
                console.log('Request cancelled successfully');
            }
        }
        set({abortController:null});
    },
    sendMessage: async (userInput) => {
        const abortController = new AbortController();
        set((state)=>({
            messages:[
                ...state.messages,
                {content:userInput,type:'user'}
            ],
            isLoading:true,
            abortController:abortController,
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
                signal:abortController.signal,
            });

            if(!response.ok) throw new Error('API 调用失败');
            console.log(response);
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let aiResponse = '';

            set((state)=>({
                messages:[
                    ...state.messages,
                    {content:'',type:'assistant'},
                ],
            }))
            
            while (true) {

                if(!get().abortController) break;

                const { done, value } = await reader!.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                console.log('收到chunk:', chunk);
                
                const lines = chunk.split('\n');
                for (const line of lines) {
                    if (!line.trim()) continue;
                    
                    try {
                        if (line.startsWith('0:')) {
                            const textContent = line.substring(2);
                            const cleanContent = textContent.startsWith('"') && textContent.endsWith('"') 
                                ? JSON.parse(textContent)
                                : textContent;
                                
                            aiResponse += cleanContent;
                            
                            set((state) => ({
                                messages: [
                                    ...state.messages.slice(0, -1),
                                    { content: aiResponse, type: 'assistant' },
                                ],
                            }));
                        } else if (line.startsWith('f:')) {
                            console.log('消息开始:', line);
                        } else if (line.startsWith('e:')) {
                            console.log('消息结束:', line);
                        } else {
                            console.log('未知格式数据:', line);
                        }
                    } catch (error) {
                        console.error('解析响应失败:', error, line);
                        if (line.startsWith('0:')) {
                            const textContent = line.substring(2);
                            aiResponse += textContent.replace(/^"|"$/g, '');
                            
                            set((state) => ({
                                messages: [
                                    ...state.messages.slice(0, -1),
                                    { content: aiResponse, type: 'assistant' },
                                ],
                            }));
                        }
                    }
                }
            }
        }catch(error){
            if((error as Error).name==='AbortError'){
                console.log('Request cancelled successfully');
            }else{
                console.error('发送消息失败:', error);
                set((state) => ({
                    messages: [...state.messages, { 
                        content: '抱歉，发生了错误，请稍后重试。', 
                        type: 'assistant' 
                    }],
                    isLoading:false,
                    abortController:null,
                }));
            }
        }finally{
            set({isLoading:false,abortController:null});
        }
    },
    reSendMessage: async (index:number) => {
        const {messages} = get();
        const lastUserMessage = messages[index-1];
        set((state)=>({
            messages:[
                ...state.messages.slice(0,index-1),
            ],
        }));
        get().sendMessage(lastUserMessage.content);
    },
}));