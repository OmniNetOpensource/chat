import { useEffect, useState } from "react"

export const useResponsive = () =>{
    const [isMobile,setIsMobile] = useState(false);

    useEffect(()=>{
        const checkScreenSize = () =>{
            setIsMobile(window.innerWidth<768);
        };

        checkScreenSize();
        window.addEventListener('resize',checkScreenSize);
        return (()=>{
            window.removeEventListener('resize',checkScreenSize);
        });
    },[]);

    return {isMobile};
}