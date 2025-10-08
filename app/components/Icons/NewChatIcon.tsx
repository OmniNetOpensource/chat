import React from 'react';

interface Props {
  className?: string;
  width?: number;
  height?: number;
}

const NewChatIcon: React.FC<Props> = ({ className, width = 24, height = 24 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`text-primary ${className}`}
    >
      {/* Squared chat bubble with rounded corners */}
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      {/* Plus sign centered */}
      <line
        x1="12"
        y1="7.5"
        x2="12"
        y2="12.5"
      />
      <line
        x1="9.5"
        y1="10"
        x2="14.5"
        y2="10"
      />
    </svg>
  );
};

export default NewChatIcon;
