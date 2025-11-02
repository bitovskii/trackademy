'use client';

import React, { createContext, useContext, useState, ReactNode, useRef } from 'react';
import { Toast, ToastType } from '@/types/Toast';

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const showToast = (message: string, type: ToastType, duration: number = 20000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      id,
      message,
      type,
      duration
    };

    setToasts(prev => [...prev, newToast]);

    // Автоматическое удаление через duration
    const timeout = setTimeout(() => {
      removeToast(id);
    }, duration);
    
    timeoutRefs.current.set(id, timeout);
  };

  const removeToast = (id: string) => {
    // Очищаем таймер если он есть
    const timeout = timeoutRefs.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutRefs.current.delete(id);
    }
    
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (message: string) => {
    showToast(message, 'success');
  };

  const showError = (message: string) => {
    showToast(message, 'error');
  };

  return (
    <ToastContext.Provider value={{
      toasts,
      showToast,
      removeToast,
      showSuccess,
      showError
    }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}