import React from 'react';

interface Props {
  className?: string;
}

const TreeIcon = ({ className }: Props) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="24"
      height="24"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      shapeRendering="geometricPrecision"
    >
      <path d="M12 22V8" />
      <path d="M5 10c-1.10457 0-2-.8954-2-2s.89543-2 2-2c1.10457 0 2 .8954 2 2s-.89543 2-2 2z" />
      <path d="M5 10c0-2.20914 1.79086-4 4-4" />
      <path d="M19 10c1.1046 0 2-.8954 2-2s-.8954-2-2-2c-1.1045 0-2 2s.8954 2 2 2z" />
      <path d="M19 10c0-2.20914-1.7909-4-4-4" />
      <path d="M12 12c1.1046 0 2-.8954 2-2s-.8954-2-2-2c-1.1046 0-2 .8954-2 2s.8954 2 2 2z" />
      <path d="M12 12v-2" />
    </svg>
  );
};

export default TreeIcon;
