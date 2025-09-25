import React, { useState } from "react";



interface infiniteListProps{
    items:string[],
    itemsHeight:number,
    showItemsNumber:number,
}


const infiniteList = ({items,itemsHeight,showItemsNumber}:infiniteListProps) => {
    const totalHeight = items.length * itemsHeight;
    const containerHeight = showItemsNumber * itemsHeight;
    const [scrollTop,setScrollTop] = useState(0);

    const handleScorll = (event:UIEvent) => {
        const target = event.target as HTMLDivElement;
        setScrollTop(target.scrollTop);
    }


    return (
    <div style={{height:`${totalHeight}px`}}>
        <div className="">

        </div>
    </div>);
}

export default infiniteList;