'use client';

import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface FreezeStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  onConfirm: (startDate: string, endDate: string, reason: string) => void;
  loading?: boolean;
}

export const FreezeStudentModal: React.FC<FreezeStudentModalProps> = ({
  isOpen,
  onClose,
  studentName,
  onConfirm,
  loading = false
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<{ startDate?: string; endDate?: string }>({});

  if (!isOpen) return null;

  const validateDates = (): boolean => {
    const newErrors: { startDate?: string; endDate?: string } = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!startDate) {
      newErrors.startDate = 'Дата начала обязательна';
    } else {
      const start = new Date(startDate);
      if (start < today) {
        newErrors.startDate = 'Дата начала не может быть в прошлом';
      }
    }

    if (!endDate) {
      newErrors.endDate = 'Дата окончания обязательна';
    } else if (startDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end <= start) {
        newErrors.endDate = 'Дата окончания должна быть позже даты начала';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateDates()) {
      onConfirm(startDate, endDate, reason);
    }
  };

  const handleClose = () => {
    setStartDate('');
    setEndDate('');
    setReason('');
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Заморозить студента
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {studentName}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Дата начала заморозки <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setErrors(prev => ({ ...prev, startDate: undefined }));
              }}
              disabled={loading}
              className={`w-full px-3 py-2 bg-white dark:bg-gray-700 border ${
                errors.startDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-900 dark:text-white transition-all duration-200`}
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>
            )}
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Дата окончания заморозки <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setErrors(prev => ({ ...prev, endDate: undefined }));
              }}
              disabled={loading}
              className={`w-full px-3 py-2 bg-white dark:bg-gray-700 border ${
                errors.endDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-900 dark:text-white transition-all duration-200`}
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Причина заморозки
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={loading}
              rows={3}
              placeholder="Укажите причину (необязательно)"
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Сохранение...' : 'Заморозить'}
          </button>
        </div>
      </div>
    </div>
  );
};
