'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import MoonIcon from '../Icons/MoonIcon';
import SunIcon from '../Icons/SunIcon';
import CloseIcon from '../Icons/CloseIcon';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Settings = ({ isOpen, onClose }: SettingsProps) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Handle ESC key to close modal
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleToggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-overlay z-modal"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-modal pointer-events-none">
        <div
          className="bg-modal-bg text-modal-text rounded-lg shadow-lg w-[90%] max-w-md p-6 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Settings</h2>
            <button
              onClick={onClose}
              className="cursor-pointer hover:bg-hoverbg rounded-md w-8 h-8 flex justify-center items-center"
              aria-label="Close settings"
            >
              <CloseIcon width={20} height={20} />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-base">Theme</span>
              <button
                onClick={handleToggleTheme}
                className="cursor-pointer hover:bg-hoverbg rounded-md w-10 h-10 flex justify-center items-center"
                aria-label="Toggle theme"
              >
                {mounted && theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;


