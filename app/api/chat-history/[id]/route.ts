import { prisma } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { auth } from '@/auth'; 


export async function PUT(req:Request,context:{params:{id:string}}){
    try{
        const session = await auth();
        const {id} = context.params;

        if(!session){
            return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const chatHistory = await prisma.chatHistory.create({
            
        });

        if(!chatHistory){
            return new NextResponse(JSON.stringify({ error: 'Chat History not found' }), { status: 404 });
        }

        return new NextResponse(JSON.stringify(chatHistory), { status: 200 });
        
    }catch(error){
        return new NextResponse(JSON.stringify({ error: error }), { status: 500 });
    }
}

export async function DELETE(req:Request,context:{params:{id:string}}){
    try{
        const session = await auth();
        const {id} = context.params;

        if(!session){
            return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        prisma.chatHistory.delete({
            where:{
                id:id,
            }
        });
        
        return new NextResponse(JSON.stringify({ message: 'Chat History deleted successfully' }), { status: 200 });
        
    }catch(error){
        return new NextResponse(JSON.stringify({ error: error }), { status: 500 });
    }
}
