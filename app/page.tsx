
import Main from './components/Main/Main';
import Sidebar from './components/Sidebar/Sidebar';

export default function HomePage() {
  return (
    <div className="flex h-screen w-screen flex-row items-stretch">
      <Sidebar />
      <Main />
    </div>
  );
}
