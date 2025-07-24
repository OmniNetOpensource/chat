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
            <div className="h-[48px] border-b-2 border-black
                        flex flex-row justify-end items-center gap-10
                        px-4">
                <div className="w-8 h-8" />
            </div>
        );
    }

    return (

        <div className="h-[48px] border-b-2 border-black
                        flex flex-row justify-end item-center gap-10
                        pd-lg">
            <button 
                onClick={handleToggleTheme}
                className="cursor-pointer
                        hover:bg-secondary
                        mg-lg
                        rounded-md"
            >
                {theme==='dark'?<SunIcon/>:<MoonIcon/>}
            </button>    
        </div>
    );
}

export default Header;