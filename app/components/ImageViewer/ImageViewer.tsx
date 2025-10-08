'use client'


import Image from 'next/image';
import { useState } from 'react';
import { createPortal } from 'react-dom';

interface ImageViewerProps {
  imageUrl: string;
}

const ImageViewer = ({ imageUrl }: ImageViewerProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const overlay = (
    <div
      className="fixed top-0 left-0 h-screen w-screen
                flex items-center justify-center z-overlay
                bg-black/50"
      onClick={() => setIsOpen(!isOpen)}
    >
      <Image
        src={imageUrl}
        alt="fullscreen"
        className="z-modal absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        width={500}
        height={500}
      />
    </div>
  );

  return (
    <>
      <Image
        src={imageUrl}
        alt="preview"
        width={100}
        height={100}
        onClick={() => setIsOpen(!isOpen)}
      />
      {isOpen && createPortal(overlay, document.body)}
    </>
  );
};

export default ImageViewer;
