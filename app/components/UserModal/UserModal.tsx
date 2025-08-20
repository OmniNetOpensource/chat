import  CloseIcon  from "../Icons/CloseIcon";
import { useSession, signOut } from "next-auth/react";

interface UserModalProps{
    onClick:()=>void
}


const UserModal = ({onClick}:UserModalProps) => {

    const {data:session} = useSession();
    const name = session?.user?.name||'user not found';
    const email = session?.user?.email||'email not found';


    return (
        <>
            <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[50] top-0 left-0 w-full h-full" 
                onClick={onClick}
            >
            </div>
            <div className="fixed 
                                bg-secondary rounded-lg 
                                w-1/2 h-1/2
                                p-4
                                z-[51]
                                shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]
                                top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="flex flex-row justify-between items-center
                                    ">
                        <h1>setttings</h1>
                        <button className="bg-transparent rounded-lg p-2 
                                            hover:bg-hoverbg cursor-pointer" 
                        onClick={onClick}><CloseIcon/></button>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-lg font-bold">User Name</h2>
                            <p className="text-sm text-gray-500">{name}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h2 className="text-lg font-bold">Email</h2>
                            <p className="text-sm text-gray-500">{email}</p>
                        </div>
                    </div>
                    <div className="bottom-0 flex flex-row justify-between items-center">
                        <button 
                            className="bg-primary text-white px-4 py-2 rounded-md
                                        hover:bg-hoverbg cursor-pointer"
                            onClick={() => signOut({ callbackUrl: '/login' })}
                        >
                            <p>退出登录</p>
                        </button>

                    </div>
                </div>
        </>
    )
}

export default UserModal;