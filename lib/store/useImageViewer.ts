'use client';

import {create} from 'zustand'

interface ImageViewerState{
    isOpen:boolean,
    imageUrl:string,
    handleClick:() => void
}


export const useImageViewerStore = create<ImageViewerState>((set,get)=>({
    isOpen:false,
    imageUrl:'',
    handleClick:()=>set({isOpen:!get().isOpen}),
}));
