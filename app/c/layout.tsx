'use client';

import Sidebar from '@/app/components/Sidebar';

export default function ChatPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen flex-row">
      <Sidebar />
      {children}
    </div>
  );
}
