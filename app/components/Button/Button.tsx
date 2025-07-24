"use client";

import { useState } from 'react';
import {
  useFloating,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  offset,
  flip,
  shift,
  autoUpdate,
} from '@floating-ui/react';

interface ButtonProps {
  content: React.ReactNode;
  description: string;
  onClick: () => void;
  className?: string;
}

const Button = ({ content, description, onClick ,className}: ButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'bottom',
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(5),
      flip(),
      shift({ padding: 8 }),
    ],
  });

  const hover = useHover(context, { move: false });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ]);

  return (
    <>
      <button
        className={`relative h-[28px] w-full
                  border-none bg-transparent hover:bg-[var(--color-secondary)] rounded-md cursor-pointer 
                  text-[10px] flex justify-start transition-colors duration-200
                  ${className || ''}`}
        onClick={onClick}
        ref={refs.setReference}
        {...getReferenceProps()}
      >
        <div className='mx-1 my-1'>
          {content}
        </div>
      </button>
      {isOpen && description!=='' &&(
        <div
          className="bg-[var(--color-primary)] text-white text-base leading-5 font-semibold rounded h-5 w-max px-2 pb-0.5 whitespace-nowrap shadow-[5px_5px_15px_rgba(0,0,0,0.2)] z-50"
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
        >
          {description}
        </div>
      )}
    </>
  );
};

export default Button;
