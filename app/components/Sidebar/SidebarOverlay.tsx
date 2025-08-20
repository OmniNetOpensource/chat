"use client";

interface SidebarOverlayProps {
  isVisible: boolean;
  onClick: () => void;
}

const SidebarOverlay: React.FC<SidebarOverlayProps> = ({ isVisible, onClick }) => {
  if (!isVisible) return null;
  
  return (
    <div 
      className="fixed top-0 left-0 w-full h-full bg-gray-50/50 dark:bg-black/50 z-[30]" 
      onClick={onClick}
    />
  );
};

export default SidebarOverlay;