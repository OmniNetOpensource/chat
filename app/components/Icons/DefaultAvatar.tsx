"use client";

import React from 'react';

interface DefaultAvatarProps {
  className?: string;
  width?: number;
  height?: number;
  initials?: string;
}

const DefaultAvatar: React.FC<DefaultAvatarProps> = ({
  className = "",
  width = 32,
  height = 32,
  initials = "U"
}) => {
  // 生成一个基于initials的随机但固定的颜色
  const getColorFromInitials = (text: string): string => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // 使用柔和的颜色
    const hue = ((hash % 360) + 360) % 360; // 0-359度的HSL色相
    return `hsl(${hue}, 70%, 60%)`; // 饱和度和亮度固定为柔和值
  };

  const backgroundColor = getColorFromInitials(initials);
  
  return (
    <div 
      className={`flex items-center justify-center rounded-full text-white font-medium ${className}`}
      style={{ 
        backgroundColor,
        width: `${width}px`,
        height: `${height}px` 
      }}
    >
      {initials.slice(0, 2).toUpperCase()}
    </div>
  );
};

export default DefaultAvatar;