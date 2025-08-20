
import Main from "./components/Main/Main";
import Sidebar from "./components/Sidebar/Sidebar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {

  // const session = await auth();

  // if(!session){
  //   redirect('/login');
  // }

  return (
      <div className="flex h-screen w-screen flex-row items-stretch">
        <Sidebar />
        <Main />
      </div>
  );
}
