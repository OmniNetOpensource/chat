'use client';

import Conversation from '../Conversation/Conversation';
import Header from '../Header/Header';

const Main: React.FC = () => {
  return (
    <div className="flex-1 h-full bg-chat-background flex flex-col m-0 items-stretch">
      <Header />
      <div className="h-full overflow-auto">
        <Conversation />
      </div>
    </div>
  );
};

export default Main;
