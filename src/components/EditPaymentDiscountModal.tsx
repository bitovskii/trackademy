'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { DiscountType } from '../types/Payment';

interface EditPaymentDiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId: string;
  studentName: string;
  originalAmount: number;
  currentDiscountType: number;
  currentDiscountValue: number;
  currentDiscountReason?: string;
  onConfirm: (discountType: number, discountValue: number, discountReason: string) => void;
  loading?: boolean;
}

export const EditPaymentDiscountModal: React.FC<EditPaymentDiscountModalProps> = ({
  isOpen,
  onClose,
  paymentId,
  studentName,
  originalAmount,
  currentDiscountType,
  currentDiscountValue,
  currentDiscountReason,
  onConfirm,
  loading = false
}) => {
  const [discountType, setDiscountType] = useState<number>(currentDiscountType);
  const [discountValue, setDiscountValue] = useState<string>(currentDiscountValue.toString());
  const [discountReason, setDiscountReason] = useState<string>(currentDiscountReason || '');
  const [errors, setErrors] = useState<{ discountValue?: string; discountReason?: string }>({});

  useEffect(() => {
    if (isOpen) {
      setDiscountType(currentDiscountType);
      setDiscountValue(currentDiscountValue.toString());
      setDiscountReason(currentDiscountReason || '');
      setErrors({});
    }
  }, [isOpen, currentDiscountType, currentDiscountValue, currentDiscountReason]);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: { discountValue?: string; discountReason?: string } = {};
    const numValue = parseFloat(discountValue) || 0;

    if (discountType === DiscountType.Percentage) {
      if (numValue < 0 || numValue > 100) {
        newErrors.discountValue = 'Скидка в процентах должна быть от 0 до 100';
      }
    } else if (discountType === DiscountType.FixedAmount) {
      if (numValue < 0) {
        newErrors.discountValue = 'Скидка не может быть отрицательной';
      } else if (numValue > originalAmount) {
        newErrors.discountValue = 'Скидка не может быть больше суммы платежа';
      }
    }

    if (discountReason && discountReason.length > 200) {
      newErrors.discountReason = 'Причина скидки не может превышать 200 символов';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateFinalAmount = (): number => {
    const numValue = parseFloat(discountValue) || 0;
    if (discountType === DiscountType.Percentage) {
      return originalAmount * (1 - numValue / 100);
    } else {
      return originalAmount - numValue;
    }
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const numValue = parseFloat(discountValue) || 0;
      onConfirm(discountType, numValue, discountReason);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const finalAmount = calculateFinalAmount();

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Редактировать скидку
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
          {/* Original Amount */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Сумма платежа</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {originalAmount.toLocaleString('ru-RU')} ₸
            </p>
          </div>

          {/* Discount Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Тип скидки
            </label>
            <select
              value={discountType}
              onChange={(e) => {
                setDiscountType(Number(e.target.value));
                setDiscountValue('0');
                setErrors({});
              }}
              disabled={loading}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-900 dark:text-white transition-all duration-200"
            >
              <option value={DiscountType.Percentage}>Процент</option>
              <option value={DiscountType.FixedAmount}>Фиксированная сумма</option>
            </select>
          </div>

          {/* Discount Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {discountType === DiscountType.Percentage ? 'Размер скидки (%)' : 'Размер скидки (₸)'}
            </label>
            <input
              type="number"
              min="0"
              max={discountType === DiscountType.Percentage ? 100 : originalAmount}
              step={discountType === DiscountType.Percentage ? '1' : '0.01'}
              value={discountValue}
              onChange={(e) => {
                setDiscountValue(e.target.value);
                setErrors(prev => ({ ...prev, discountValue: undefined }));
              }}
              disabled={loading}
              placeholder={discountType === DiscountType.Percentage ? 'От 0 до 100' : 'От 0 до суммы платежа'}
              className={`w-full px-3 py-2 bg-white dark:bg-gray-700 border ${
                errors.discountValue ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-900 dark:text-white transition-all duration-200`}
            />
            {errors.discountValue && (
              <p className="mt-1 text-sm text-red-500">{errors.discountValue}</p>
            )}
          </div>

          {/* Discount Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Причина скидки
            </label>
            <textarea
              value={discountReason}
              onChange={(e) => {
                setDiscountReason(e.target.value);
                setErrors(prev => ({ ...prev, discountReason: undefined }));
              }}
              disabled={loading}
              rows={3}
              maxLength={200}
              placeholder="Укажите причину скидки (необязательно)"
              className={`w-full px-3 py-2 bg-white dark:bg-gray-700 border ${
                errors.discountReason ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200 resize-none`}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.discountReason ? (
                <p className="text-sm text-red-500">{errors.discountReason}</p>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {discountReason.length}/200 символов
                </p>
              )}
            </div>
          </div>

          {/* Final Amount Preview */}
          <div className="bg-violet-50 dark:bg-violet-900/20 rounded-lg p-4 border border-violet-200 dark:border-violet-800">
            <p className="text-sm text-violet-600 dark:text-violet-400 mb-1">Итоговая сумма после скидки</p>
            <p className="text-2xl font-bold text-violet-700 dark:text-violet-300">
              {finalAmount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₸
            </p>
            {parseFloat(discountValue) > 0 && (
              <p className="text-xs text-violet-600 dark:text-violet-400 mt-1">
                Скидка: {discountType === DiscountType.Percentage 
                  ? `${discountValue}%` 
                  : `${parseFloat(discountValue).toLocaleString('ru-RU')} ₸`}
              </p>
            )}
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
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
};
