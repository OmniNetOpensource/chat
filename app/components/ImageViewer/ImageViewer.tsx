'use client'

import { useImageViewerStore } from "@/app/lib/store/useImageViewer";

import Image from "next/image";


interface ImageViewerProps{
    imageUrl:string
}

const ImageViewer = ({imageUrl}:ImageViewerProps)=>{

    const {isOpen,handleClick} = useImageViewerStore();


    return (
        <>
            <Image src={imageUrl} alt="preview" width={100} height={100} onClick={handleClick}/>
            {isOpen &&   
                <div
                    className="h-full w-full
                                bg-black/50"
                    onClick={handleClick}
                >
                    <Image
                        src={imageUrl}
                        alt="fullscreen"
                        className="z-50"
                        width={500}
                        height={500}
                    />
                </div>}
        </>
    );
}


export default ImageViewer;