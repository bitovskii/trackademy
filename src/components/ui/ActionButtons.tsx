'use client';

import React from 'react';

interface ActionButtonsProps {
  onCancel: () => void;
  submitText?: string;
  cancelText?: string;
  isSubmitting?: boolean;
  submitDisabled?: boolean;
  loadingText?: string;
  submitButtonClass?: string;
  cancelButtonClass?: string;
  showSubmitButton?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onCancel,
  submitText = 'Сохранить',
  cancelText = 'Отмена',
  isSubmitting = false,
  submitDisabled = false,
  loadingText = 'Сохранение...',
  submitButtonClass = '',
  cancelButtonClass = '',
  showSubmitButton = true,
}) => {
  return (
    <div className="flex space-x-2 pt-1">
      <button
        type="button"
        onClick={onCancel}
        className={`flex-1 px-2 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors ${cancelButtonClass}`}
      >
        {cancelText}
      </button>
      {showSubmitButton && (
        <button
          type="submit"
          disabled={isSubmitting || submitDisabled}
          className={`flex-1 btn-primary text-xs py-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${submitButtonClass}`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="loading-spinner mr-1"></div>
              {loadingText}
            </div>
          ) : (
            submitText
          )}
        </button>
      )}
    </div>
  );
};