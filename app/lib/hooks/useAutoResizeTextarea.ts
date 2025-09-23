"use client";

import { useRef, useCallback } from 'react';
import { useResponsive } from './useResponsive';

export const useAutoResizeTextarea = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isMobile } = useResponsive();
  const initialHeight = 24;

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${initialHeight}px`;
      const lineHeight = 24;
      const maxHeight = isMobile ? lineHeight * 5 : lineHeight * 7;
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = `${newHeight}px`;
    }
  }, [initialHeight, isMobile]);

  const resetTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${initialHeight}px`;
    }
  }, [initialHeight]);

  return {
    textareaRef,
    adjustTextareaHeight,
    resetTextareaHeight,
  };
};
