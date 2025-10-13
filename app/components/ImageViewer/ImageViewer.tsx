'use client';

import Image from 'next/image';
import { useState } from 'react';
import { createPortal } from 'react-dom';

interface ImageViewerProps {
  imageUrl: string;
}

interface ImageViewerOverlayProps {
  imageUrl: string;
  onClose: () => void;
}

const ImageViewerOverlay = ({ imageUrl, onClose }: ImageViewerOverlayProps) => {
  const [scale, setScale] = useState(1);
  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();

    const factor = 1.11;
    const MAX_SCALE = 3;
    const MIN_SCALE = 0.5;
    setScale((prev) => {
      return Math.min(
        MAX_SCALE,
        Math.max(MIN_SCALE, event.deltaY > 0 ? prev / factor : prev * factor),
      );
    });
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
              z-modal 
                bg-black/50"
      onClick={onClose}
    >
      <div
        className="h-fit w-fit bg-transparent
        absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          transition: 'transform 80ms ease-out',
        }}
      >
        <img
          src={imageUrl}
          alt="fullscreen"
          width={500}
          height={500}
        />
      </div>
    </div>
  );
};

const ImageViewer = ({ imageUrl }: ImageViewerProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      <Image
        src={imageUrl}
        alt="preview"
        width={100}
        height={100}
        onClick={() => setIsOpen(!isOpen)}
      />
      {isOpen &&
        createPortal(
          <ImageViewerOverlay
            imageUrl={imageUrl}
            onClose={() => setIsOpen(false)}
          />,
          document.body,
        )}
    </>
  );
};

export default ImageViewer;
