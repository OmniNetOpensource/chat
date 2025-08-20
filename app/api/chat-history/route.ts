import { NextResponse } from "next/server";
import { prisma } from '@/app/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { auth } from '@/auth';

export async function GET(){
    try{
        const session = await auth();

        if(!session?.user?.id){
            return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }
        
        const chatHistory = await prisma.chatHistory.findMany({
            where: {
                userId: session.user.id
            },
            select: {
                id: true,
                title: true,
            },
            take: 5,
            orderBy: {
                createdAt: 'desc'
            }
        });

        return new NextResponse(JSON.stringify(chatHistory), { status: 200 });


    }catch(error){
        return new NextResponse(JSON.stringify({ error: error }), { status: 500 });
    }
}