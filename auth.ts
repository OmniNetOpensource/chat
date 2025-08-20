// ./auth.ts

import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import {prisma} from '@/app/lib/db'
// const prisma = new PrismaClient()

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma), 
    providers: [Google({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret:process.env.GOOGLE_CLIENT_SECRET!,
        authorization:{
            params:{
                prompt:"select_account",
            }
        }
    })],
    pages:{
        signIn:"/login",
    },
    callbacks:{
        async session({session,user}){
            if(session?.user){
                session.user.id=user.id;
            }
            return session;
        }
    }
})