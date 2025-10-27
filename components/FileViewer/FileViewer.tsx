'use client';

interface FileViewerProps {
  fileName?: string;
}

const FileViewer = ({ fileName = 'PDF document' }: FileViewerProps) => {
  return (
    <div
      className="flex h-20 w-20 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800"
      aria-label={fileName}
      role="img"
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M30 4H12a2 2 0 0 0-2 2v36a2 2 0 0 0 2 2h24a2 2 0 0 0 2-2V12z"
          fill="#E53935"
        />
        <path
          d="M30 4v8h8"
          fill="#EF9A9A"
        />
        <path
          d="M15.5 32.5v-9h2.9c1.9 0 3 .9 3 2.6 0 1.1-.7 2-1.6 2.3l2 4.1h-2.2l-1.7-3.6h-.9v3.6h-1.5zm1.5-5h1c.9 0 1.3-.4 1.3-1 0-.7-.4-1-1.3-1h-1v2zM23 32.5v-9h3.8c1.7 0 2.8.9 2.8 2.4 0 1.1-.6 1.9-1.6 2.2 1.2.2 1.8 1.1 1.8 2.3 0 1.7-1.2 2.6-3 2.6H23zm1.5-5.2h1.7c.8 0 1.3-.4 1.3-1 0-.7-.5-1-1.3-1h-1.7v2zm0 3.8h2c.9 0 1.4-.4 1.4-1.1 0-.7-.5-1.1-1.4-1.1h-2v2.2zM32.5 32.5v-9H38v1.5h-4v2.1h3.4v1.5H34v2.4h4.1v1.5h-5.6z"
          fill="#fff"
        />
      </svg>
    </div>
  );
};

export default FileViewer;
