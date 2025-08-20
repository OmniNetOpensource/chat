'use client';

import { useResponsiveStore } from "@/app/lib/store/useResponsiveStore";
import { useEffect,type ReactNode } from "react";


interface ResponsiveProviderProps{
    children:ReactNode,
}



export const ResponsiveProvider = ({children}:ResponsiveProviderProps)=>{

    const {setIsMobile} = useResponsiveStore();

    useEffect(()=>{
        if(typeof window === 'undefined') return;
        
        const mql = window.matchMedia('(max-width:768px)');

        const apply = () => setIsMobile(mql.matches);
        apply();


        const add = ()=>{
            mql.addEventListener('change',apply);
        }
        add();
        const remove = () =>{
            mql.removeEventListener('change',apply);
        }
        return remove;
    },[setIsMobile]);

    return (
        <>{children}</>
    );
}