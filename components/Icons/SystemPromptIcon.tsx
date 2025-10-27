import { FC } from 'react';

interface Props {
  className?: string;
}

const SystemPromptIcon: FC<Props> = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="2"
        ry="2"
      ></rect>
      <path d="m7 8 3 3-3 3"></path>
      <path d="M12 14h5"></path>
    </svg>
  );
};

export default SystemPromptIcon;
