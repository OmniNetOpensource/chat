import MoonIcon from "../Icons/MoonIcon";
import SunIcon from "../Icons/SunIcon";
import { useTheme } from "next-themes";

const Header = ()=>{

    const {theme,setTheme} = useTheme();



    return (
        <div className="h-[48px] border-b-2 border-black
                        flex flex-row justify-end item-center gap-10
                        pd-lg">
            <button 
                onClick={()=>{theme==='light'?setTheme('dark'):setTheme('light')}}
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