'use client';

import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  gradientFrom?: string;
  gradientTo?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  maxHeight?: string;
}

const getGradientClasses = (from: string, to: string) => {
  const gradientMap: { [key: string]: string } = {
    'emerald-500_lime-600': 'bg-gradient-to-r from-emerald-500 to-lime-600',
    'teal-500_cyan-600': 'bg-gradient-to-r from-teal-500 to-cyan-600',
    'violet-500_purple-600': 'bg-gradient-to-r from-violet-500 to-purple-600',
    'blue-500_indigo-600': 'bg-gradient-to-r from-blue-500 to-indigo-600',
    'red-500_pink-600': 'bg-gradient-to-r from-red-500 to-pink-600',
  };
  
  const key = `${from}_${to}`;
  return gradientMap[key] || `bg-gradient-to-r from-${from} to-${to}`;
};

const getMaxWidthClass = (maxWidth: string) => {
  const widthMap = {
    'sm': 'max-w-sm',
    'md': 'max-w-md', 
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl'
  };
  return widthMap[maxWidth as keyof typeof widthMap] || 'max-w-lg';
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  gradientFrom = 'emerald-500',
  gradientTo = 'lime-600',
  children,
  maxWidth = 'lg',
  maxHeight = '80vh'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop with blur */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>
      
      {/* Modal container */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div 
          className={`relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 w-full ${getMaxWidthClass(maxWidth)} transform transition-all`}
          style={{ maxHeight }}
        >
          {/* Header with gradient */}
          <div className={`${getGradientClasses(gradientFrom, gradientTo)} px-6 py-4 rounded-t-2xl`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {Icon && (
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-bold text-white">{title}</h2>
                  {subtitle && (
                    <p className="text-white/80 text-sm">{subtitle}</p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
              >
                <XMarkIcon className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 80px)' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;