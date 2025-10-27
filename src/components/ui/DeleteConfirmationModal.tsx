'use client';

import React from 'react';
import { XMarkIcon, ExclamationTriangleIcon, TrashIcon } from '@heroicons/react/24/outline';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
  isLoading?: boolean;
  danger?: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  isLoading = false,
  danger = true
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
        {/* Header */}
        <div className={`px-6 py-4 rounded-t-2xl ${
          danger 
            ? 'bg-gradient-to-r from-red-500 to-red-600' 
            : 'bg-gradient-to-r from-orange-500 to-amber-500'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <ExclamationTriangleIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                {title}
              </h3>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <XMarkIcon className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <div className="text-center">
            {/* Icon */}
            <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 ${
              danger 
                ? 'bg-red-100 dark:bg-red-900/20' 
                : 'bg-orange-100 dark:bg-orange-900/20'
            }`}>
              <TrashIcon className={`h-8 w-8 ${
                danger 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-orange-600 dark:text-orange-400'
              }`} />
            </div>

            {/* Message */}
            <div className="mb-6">
              <p className="text-gray-900 dark:text-gray-100 text-base leading-6">
                {message}
              </p>
              {itemName && (
                <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                  <span className={`px-2 py-1 rounded-md ${
                    danger 
                      ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300' 
                      : 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                  }`}>
                    {itemName}
                  </span>
                </p>
              )}
            </div>

            {/* Warning Notice */}
            <div className={`p-3 rounded-lg mb-6 ${
              danger 
                ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' 
                : 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
            }`}>
              <p className={`text-sm ${
                danger 
                  ? 'text-red-800 dark:text-red-200' 
                  : 'text-orange-800 dark:text-orange-200'
              }`}>
                ⚠️ Это действие нельзя отменить
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-b-2xl">
          <div className="flex space-x-3">
            {/* Cancel Button */}
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 
                       bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 
                       rounded-xl hover:bg-gray-50 dark:hover:bg-gray-500 
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Отмена
            </button>

            {/* Confirm Delete Button */}
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-xl 
                       focus:outline-none focus:ring-2 focus:ring-offset-2 
                       transition-all disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center space-x-2 ${
                danger 
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                  : 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Удаление...</span>
                </>
              ) : (
                <>
                  <TrashIcon className="h-4 w-4" />
                  <span>Удалить</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};