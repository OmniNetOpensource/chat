import React from 'react';

interface RedoIconProps {
  width?: number;
  height?: number;
}

const RedoIcon: React.FC<RedoIconProps> = ({ 
  width = 24, 
  height = 24 
}) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 24 24"
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.39 0 4.68.94 6.36 2.64L21 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path 
        d="M21 4v4h-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default RedoIcon; 