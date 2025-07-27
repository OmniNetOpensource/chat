import React from 'react';

interface Props {
  width?: number;
  height?: number;
}

const CopyIcon = ({ width = 24, height = 24 }: Props) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 4v12a2 2 0 002 2h8a2 2 0 002-2V7.242a2 2 0 00-.586-1.414l-2.242-2.242A2 2 0 0016.758 3H10a2 2 0 00-2 1z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 3v3a1 1 0 001 1h3M4 9v12a2 2 0 002 2h8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CopyIcon; 