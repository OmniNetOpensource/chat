"use client";

import { ChangeEvent, useState } from 'react';

interface fileType {
  id: string;
  base64: string;
}

type FileReaderFunction= (file:File) => Promise<string>;

const readFileAsBase64:FileReaderFunction =(file) => {
  return new Promise((resolve,reject)=>{
    const reader = new FileReader();
    reader.onload = ()=> resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export const useFileUpload = () => {
  const [files,setFiles] =useState<fileType[]>([]); 

  const removeFiles = (id:string) => {
    const newFiles= files.filter((file)=>(file.id !== id));
    setFiles(newFiles);
  }
  
  const addFiles =async (event:ChangeEvent<HTMLInputElement>) => {
    const filesToAdd = event.target.files;
    if(!filesToAdd){
      return;
    }

    try{
      const filesProcessPromise = Array.from(filesToAdd).map(async (file)=>{
        const base64 =await readFileAsBase64(file);
        return {
          id:crypto.randomUUID(),
          base64:base64,
        }
      });

      const newFiles = await Promise.all(filesProcessPromise);

      setFiles(prevFiles=>[...prevFiles,...newFiles]);
    }catch(error){
      console.log(error);
    }
  }

  const initFiles = (initialFiles:string[]) => {
    setFiles(initialFiles.map((file_url)=>({id:crypto.randomUUID(),base64:file_url})));
  }
  return ({files,removeFiles,addFiles,initFiles});
};

