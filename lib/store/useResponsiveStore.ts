import {create} from 'zustand';


interface ResponsiveState{
    isMobile: boolean,
    setIsMobile: (v:boolean) => void,
}

export const useResponsiveStore = create<ResponsiveState>((set)=>({
    isMobile: false,
    setIsMobile: (v:boolean) => {
        set({isMobile:v});
    },
}));