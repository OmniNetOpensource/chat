import React from 'react';

const ExpandSidebarIcon = ({ width = 24, height = 24, ...props }: React.SVGProps<SVGSVGElement>) => (
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
    {...props}
  >
    <path d="M3 3h18v18H3z" fill="none"/>
    <path d="M9 21V3" strokeWidth="1.5" />
    <path d="m14 9 3 3-3 3" strokeWidth="1.5" />
  </svg>
);

export default ExpandSidebarIcon;
