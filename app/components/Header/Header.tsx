'use client';

import { useEffect, useState } from 'react';
import MoonIcon from '../Icons/MoonIcon';
import SunIcon from '../Icons/SunIcon';
import { useTheme } from 'next-themes';
import ModelSelect from './ModelSelect';

const Header = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };

  return (
    <div
      className="h-[48px] shadow-[0_2px_6px_0_rgba(0,0,0,0.04)]
                        flex flex-row justify-between items-center
                        py-[3px]
                        px-4"
    >
      <ModelSelect />
      <button
        onClick={handleToggleTheme}
        className="cursor-pointer
                            hover:bg-hoverbg
                            rounded-md
                            w-[40px] h-[40px]
                            flex justify-center items-center"
      >
        {mounted === true && theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </button>
    </div>
  );
};

export default Header;
