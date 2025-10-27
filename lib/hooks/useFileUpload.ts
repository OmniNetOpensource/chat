'use client';

import { ChangeEvent, useState } from 'react';
import { FileBlock, ImageBlock } from '../types';

type FileReaderFunction = (file: File) => Promise<string>;
type UploadBlock = ImageBlock | FileBlock;

const readFileAsBase64: FileReaderFunction = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

interface useFileUploadProps {
  initialFiles?: UploadBlock[];
}

function mapInitialFiles(initialFiles: UploadBlock[] | undefined): UploadBlock[] {
  if (!initialFiles || initialFiles.length === 0) {
    return [];
  }

  return initialFiles.map((file) => ({
    id: file.id,
    base64: file.base64,
    type: file.type,
  }));
}

async function createUploadBlock(file: File): Promise<UploadBlock> {
  const base64 = await readFileAsBase64(file);
  const id = crypto.randomUUID();

  if (file.type.startsWith('image/')) {
    return {
      id,
      base64,
      type: 'image',
    };
  }

  return {
    id,
    base64,
    type: 'file',
  };
}

export const useFileUpload = ({ initialFiles }: useFileUploadProps) => {
  const [files, setFiles] = useState<UploadBlock[]>(() => mapInitialFiles(initialFiles));
  const clearFiles = () => {
    setFiles([]);
  };

  const removeFiles = (id: string) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
  };

  const addFilesFromInput = async (event: ChangeEvent<HTMLInputElement>) => {
    const filesToAdd = event.target.files;
    if (!filesToAdd) {
      return;
    }

    try {
      const newFiles = await Promise.all(Array.from(filesToAdd).map(createUploadBlock));

      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    } catch (error) {
      console.log(error);
    } finally {
      event.target.value = '';
    }
  };

  const addFilesFromPaste = async (file: File) => {
    try {
      const newFile = await createUploadBlock(file);
      setFiles((prevFiles) => [...prevFiles, newFile]);
    } catch (error) {
      console.log(error);
    }
  };

  const addFilesFromDrop = async (fileList: FileList | File[]) => {
    const accepted = Array.from(fileList).filter(
      (file) => file.type.startsWith('image/') || file.type === 'application/pdf',
    );
    if (accepted.length === 0) return;
    try {
      const newFiles = await Promise.all(accepted.map(createUploadBlock));
      setFiles((prev) => [...prev, ...newFiles]);
    } catch (error) {
      console.log(error);
    }
  };
  return { files, removeFiles, addFilesFromInput, addFilesFromPaste, clearFiles, addFilesFromDrop };
};
