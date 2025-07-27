// 从 src/App.tsx 复制过来后的代码
import Main from "./components/Main/Main";
import Sidebar from "./components/Sidebar/Sidebar";


// 将 function App() 修改为 function HomePage()
export default function HomePage() {


  return (
    <div className="flex h-screen w-screen flex-row">
        <Sidebar/>
        <Main/>
    </div>
  );
}
