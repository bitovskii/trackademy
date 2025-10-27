'use client';

import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  gradientFrom?: string;
  gradientTo?: string;
}

export const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  maxWidth = 'lg',
  gradientFrom = 'from-blue-500',
  gradientTo = 'to-purple-600',
}) => {
  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidthClasses[maxWidth]} max-h-[70vh] overflow-hidden`}>
        {/* Header with gradient */}
        <div className={`relative bg-gradient-to-r ${gradientFrom} ${gradientTo} p-2 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {icon && (
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                  {icon}
                </div>
              )}
              <div>
                <h2 className="text-sm font-bold">{title}</h2>
                {subtitle && (
                  <p className="text-white/80 text-xs">{subtitle}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 hover:bg-white/40 hover:scale-110 rounded-lg flex items-center justify-center transition-all duration-200"
              title="Закрыть"
            >
              <XMarkIcon className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-2 max-h-[calc(70vh-60px)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};