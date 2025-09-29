import { useEffect, useState } from 'react';

const PromptModal = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/50">
      <div className="fixed w-1/2 h-1/2 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-4">
        hello
      </div>
    </div>
  );
};

const SystemPrompt = () => {
  const [promptEditing, setPromptEditing] = useState(false);

  return (
    <>
      <button onClick={() => setPromptEditing(!promptEditing)}>Toggle Prompt</button>
      {promptEditing && <PromptModal />}
    </>
  );
};

export default SystemPrompt;
