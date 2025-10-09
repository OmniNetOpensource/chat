'use client';

import { useEffect } from 'react';
import Main from './components/Main/Main';
import Sidebar from './components/Sidebar/Sidebar';
import { useChatStore } from './lib/store/useChatStore';

export default function HomePage() {
  const { clear } = useChatStore();
  useEffect(() => {
    clear();
  }, []);
  return <Main />;
}
