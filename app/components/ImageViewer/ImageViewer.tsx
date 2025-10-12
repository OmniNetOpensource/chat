'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ImageViewerProps {
  imageUrl: string;
}

const ImageViewer = ({ imageUrl }: ImageViewerProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const overlay = () => {
    const [scale, setScale] = useState(1);
    const handleWeel = () => {
      // TODO: Implement wheel handling
    };

    const handlePointerDown = () => {
      // TODO: Implement pointer down handling
    };

    const handlePointerMove = () => {
      // TODO: Implement pointer move handling
    };

    const handlePointerUp = () => {
      // TODO: Implement pointer up handling
    };
    return (
      <div
        className="fixed top-0 left-0 h-screen w-screen
                flex items-center justify-center z-overlay
                bg-black/50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div
          className="h-fit w-fit bg-transparent"
          onWheel={handleWeel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <img
            src={imageUrl}
            alt="fullscreen"
            className="z-modal absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            width={500}
            height={500}
          />
        </div>
      </div>
    );
  };

  return (
    <>
      <Image
        src={imageUrl}
        alt="preview"
        width={100}
        height={100}
        onClick={() => setIsOpen(!isOpen)}
      />
      {isOpen && createPortal(overlay(), document.body)}
    </>
  );
};

export default ImageViewer;
