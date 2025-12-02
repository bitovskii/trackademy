'use client';

import React, { useState, useEffect } from 'react';
import { BaseModal } from './ui/BaseModal';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { PaymentApiService } from '../services/PaymentApiService';
import { useApiToast } from '../hooks/useApiToast';

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: {
    id: string;
    paymentPeriod: string;
    amount: number;
    remainingAmount?: number;
  } | undefined;
  onSuccess?: () => void;
}

interface RefundFormData {
  refundType: 'full' | 'partial';
  refundAmount: string;
  refundReason: string;
}

export const RefundModal: React.FC<RefundModalProps> = ({
  isOpen,
  onClose,
  payment,
  onSuccess
}) => {
  const [formData, setFormData] = useState<RefundFormData>({
    refundType: 'full',
    refundAmount: '',
    refundReason: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { handleApiOperation } = useApiToast();

  // Сбрасываем форму при открытии модального окна
  useEffect(() => {
    if (isOpen && payment) {
      // Для частично возвращенных платежей используем остаток
      const availableAmount = payment.remainingAmount !== undefined ? payment.remainingAmount : payment.amount;
      setFormData({
        refundType: 'full',
        refundAmount: String(availableAmount),
        refundReason: ''
      });
      setErrors({});
    }
  }, [isOpen, payment]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.refundReason.trim()) {
      newErrors.refundReason = 'Укажите причину возврата';
    }

    if (!formData.refundAmount || parseFloat(formData.refundAmount) <= 0) {
      newErrors.refundAmount = 'Укажите корректную сумму возврата';
    } else {
      const amount = parseFloat(formData.refundAmount);
      const maxAmount = payment?.remainingAmount || payment?.amount || 0;
      if (amount > maxAmount) {
        newErrors.refundAmount = `Сумма не может быть больше ${formatAmount(maxAmount)}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!payment || !validateForm()) return;

    setIsLoading(true);

    try {
      const amount = parseFloat(formData.refundAmount);
      
      if (formData.refundType === 'full') {
        await handleApiOperation(
          () => PaymentApiService.refundPayment(payment.id, formData.refundReason),
          { successMessage: 'Полный возврат платежа выполнен' }
        );
      } else {
        await handleApiOperation(
          () => PaymentApiService.partialRefundPayment(payment.id, amount, formData.refundReason),
          { successMessage: 'Частичный возврат платежа выполнен' }
        );
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      // Ошибки уже обрабатываются в handleApiOperation
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefundTypeChange = (type: 'full' | 'partial') => {
    setFormData(prev => ({
      ...prev,
      refundType: type,
      refundAmount: type === 'full' 
        ? String(payment?.remainingAmount || payment?.amount || 0)
        : ''
    }));
    setErrors(prev => ({ ...prev, refundAmount: '' }));
  };

  if (!payment) return null;

  const availableAmount = payment.remainingAmount || payment.amount;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Возврат платежа"
      subtitle={`Платеж: ${payment.paymentPeriod}`}
      icon={<ArrowPathIcon className="w-5 h-5" />}
      gradientFrom="from-purple-500"
      gradientTo="to-pink-600"
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Информация о платеже */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            Доступно для возврата:
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatAmount(availableAmount)}
          </div>
        </div>

        {/* Тип возврата */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Тип возврата:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className={`relative flex cursor-pointer rounded-lg border p-3 focus:outline-none ${
              formData.refundType === 'full'
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
            }`}>
              <input
                type="radio"
                name="refundType"
                value="full"
                checked={formData.refundType === 'full'}
                onChange={() => handleRefundTypeChange('full')}
                className="sr-only"
              />
              <span className="flex flex-1">
                <span className="flex flex-col">
                  <span className="block text-sm font-medium">Полный возврат</span>
                </span>
              </span>
              {formData.refundType === 'full' && (
                <div className="absolute -inset-px rounded-lg border-2 border-purple-500 pointer-events-none" />
              )}
            </label>

            <label className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
              formData.refundType === 'partial'
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
            }`}>
              <input
                type="radio"
                name="refundType"
                value="partial"
                checked={formData.refundType === 'partial'}
                onChange={() => handleRefundTypeChange('partial')}
                className="sr-only"
              />
              <span className="flex flex-1">
                <span className="flex flex-col">
                  <span className="block text-sm font-medium">Частичный возврат</span>
                </span>
              </span>
              {formData.refundType === 'partial' && (
                <div className="absolute -inset-px rounded-lg border-2 border-purple-500 pointer-events-none" />
              )}
            </label>
          </div>
        </div>

        {/* Сумма возврата */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Сумма возврата:
          </label>
          <div className="relative">
            <input
              type="number"
              value={formData.refundAmount}
              onChange={(e) => setFormData(prev => ({ ...prev, refundAmount: e.target.value }))}
              disabled={formData.refundType === 'full'}
              max={availableAmount}
              min={0}
              step={0.01}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400 ${
                errors.refundAmount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Введите сумму..."
            />
          </div>
          {errors.refundAmount && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.refundAmount}</p>
          )}
        </div>

        {/* Причина возврата */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Причина возврата:
          </label>
          <textarea
            value={formData.refundReason}
            onChange={(e) => setFormData(prev => ({ ...prev, refundReason: e.target.value }))}
            rows={2}
            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              errors.refundReason ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Укажите причину возврата..."
          />
          {errors.refundReason && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.refundReason}</p>
          )}
        </div>

        {/* Кнопки действий */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !formData.refundReason.trim() || !formData.refundAmount || parseFloat(formData.refundAmount) <= 0}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Выполняется...
              </span>
            ) : (
              `Выполнить ${formData.refundType === 'full' ? 'полный' : 'частичный'} возврат`
            )}
          </button>
        </div>
      </div>
    </BaseModal>
  );
};