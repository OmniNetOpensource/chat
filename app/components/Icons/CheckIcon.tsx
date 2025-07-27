import React from 'react';

interface CheckIconProps {
  width?: number;
  height?: number;
}

const CheckIcon: React.FC<CheckIconProps> = ({ width = 24, height = 24 }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
        fill="currentColor"
      />
    </svg>
  );
};

export default CheckIcon; 