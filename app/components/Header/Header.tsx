import { useEffect, useState } from "react";
import MoonIcon from "../Icons/MoonIcon";
import SunIcon from "../Icons/SunIcon";
import { useTheme } from "next-themes";

const Header = ()=>{

    const {theme,setTheme} = useTheme();
    const [mounted,setMounted] = useState<boolean>(false);

    useEffect(()=>{
        setMounted(true);
    },[]);

    const handleToggleTheme = () => {
        if(theme === 'light'){
            setTheme('dark');
        }
        else{
            setTheme('light');
        }
    }
    
    if (!mounted) {
        return (
            <div className="h-[48px] shadow-[0_2px_6px_0_rgba(0,0,0,0.04)]
                        flex flex-row justify-end items-center gap-10
                        px-4">
                <div className="w-8 h-8" />
            </div>
        );
    }


    return (

        <div className="h-[48px] shadow-[0_2px_6px_0_rgba(0,0,0,0.04)]
                        flex flex-row justify-end item-center gap-10
                        py-[3px]
                        px-2">
            <button 
                onClick={handleToggleTheme}
                className="cursor-pointer
                        hover:bg-hoverbg
                        rounded-md
                        w-[40px] h-[40px]
                        flex justify-center items-center"
            >
                {theme==='dark'?<SunIcon/>:<MoonIcon/>}
            </button>    
        </div>
    );
}

export default Header;
