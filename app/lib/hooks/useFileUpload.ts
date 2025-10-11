'use client';

import { ChangeEvent, useState } from 'react';

interface fileType {
  id: string;
  base64: string;
}

type FileReaderFunction = (file: File) => Promise<string>;

const readFileAsBase64: FileReaderFunction = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

interface useFileUploadProps {
  initialFiles: string[];
}

export const useFileUpload = ({ initialFiles }: useFileUploadProps) => {
  const [files, setFiles] = useState<fileType[]>(
    () => initialFiles?.map((file_url) => ({ id: crypto.randomUUID(), base64: file_url })) || [],
  );
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
      const filesProcessPromise = Array.from(filesToAdd).map(async (file) => {
        const base64 = await readFileAsBase64(file);
        return {
          id: crypto.randomUUID(),
          base64: base64,
        };
      });

      const newFiles = await Promise.all(filesProcessPromise);

      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    } catch (error) {
      console.log(error);
    } finally {
      event.target.value = '';
    }
  };

  const addFilesFromPaste = async (file: File) => {
    try {
      const base64 = await readFileAsBase64(file);
      const newFile = {
        id: crypto.randomUUID(),
        base64: base64,
      };
      setFiles((prevFiles) => [...prevFiles, newFile]);
    } catch (error) {
      console.log(error);
    }
  };

  return { files, removeFiles, addFilesFromInput, addFilesFromPaste, clearFiles };
};
