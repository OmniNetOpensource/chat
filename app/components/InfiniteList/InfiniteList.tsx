import React, { useState, useEffect, useRef } from 'react';

interface InfiniteListProps {
  items: string[];
  itemHeight: number;
  showItemsNumber: number;
  handleClick: (index: number) => void;
}

type itemType = {
  name: string;
  id: number;
};

const InfiniteList = ({ items, itemHeight, showItemsNumber, handleClick }: InfiniteListProps) => {
  const containerHeight = showItemsNumber * itemHeight;
  const totalHeight = items.length * itemHeight;
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: showItemsNumber });

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = event.currentTarget.scrollTop;

    // 计算可见项的起始和结束索引
    const start = Math.min(Math.floor(newScrollTop / itemHeight), items.length - showItemsNumber);
    const end = Math.min(
      start + showItemsNumber + 2, // 多渲染2项作为缓冲
      items.length,
    );

    setVisibleRange({ start, end });
  };

  // 获取当前可见的项
  const visibleItems = items.slice(visibleRange.start, visibleRange.end);

  // 计算第一个可见项的偏移量
  const offsetY = visibleRange.start * itemHeight;

  return (
    <div
      style={{
        height: `${containerHeight}px`,
        overflowY: 'auto',
      }}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: `${totalHeight}px`,
          position: 'relative',
        }}
      >
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = visibleRange.start + index;
            return (
              <div
                key={actualIndex}
                style={{
                  height: `${itemHeight}px`,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 10px',
                  cursor: 'pointer',
                }}
                onClick={() => handleClick(actualIndex)}
              >
                <span>{item}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InfiniteList;
