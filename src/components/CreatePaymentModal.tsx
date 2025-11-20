'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { CreatePaymentRequest } from '../types/Payment';
import { PaymentApiService } from '../services/PaymentApiService';
import { UserApiService } from '../services/UserApiService';
import { User } from '../types/User';
import { useApiToast } from '../hooks/useApiToast';

interface CreatePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  groupId: string;
  groupName: string;
  groupPrice?: number;
  onSuccess: () => void;
}

export const CreatePaymentModal: React.FC<CreatePaymentModalProps> = ({
  isOpen,
  onClose,
  studentId,
  studentName,
  groupId,
  groupName,
  groupPrice,
  onSuccess
}) => {
  const { createOperation } = useApiToast();
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [formData, setFormData] = useState<CreatePaymentRequest>({
    studentId,
    groupId,
    paymentPeriod: '',
    type: 1, // Ежемесячный по умолчанию
    originalAmount: 0,
    discountPercentage: 0,
    discountReason: '',
    periodStart: new Date().toISOString().split('T')[0], // Текущая дата
    periodEnd: ''
  });

  // Для отображения в полях ввода
  const [displayValues, setDisplayValues] = useState({
    originalAmount: '',
    discountPercentage: ''
  });

  // Загружаем данные пользователя при открытии модалки
  useEffect(() => {
    if (isOpen && studentId) {
      loadUserData();
    }
  }, [isOpen, studentId]);

  // Автоматически заполняем сумму ценой из группы при открытии модалки
  useEffect(() => {
    if (isOpen && groupPrice && groupPrice > 0) {
      setFormData(prev => ({
        ...prev,
        originalAmount: groupPrice
      }));
      setDisplayValues(prev => ({
        ...prev,
        originalAmount: groupPrice.toString()
      }));
    }
  }, [isOpen, groupPrice]);

  // Обновляем studentId и groupId в formData когда они изменяются
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      studentId,
      groupId
    }));
  }, [studentId, groupId]);

  const loadUserData = async () => {
    setLoadingUser(true);
    try {
      const user = await UserApiService.getUserById(studentId);
      setUserData(user);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoadingUser(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log('Отправляемые данные платежа:', formData); // Для отладки

    const result = await createOperation(
      () => PaymentApiService.createPayment(formData),
      'платёж'
    );

    if (result.success) {
      onSuccess();
      onClose();
      // Сбрасываем форму
      setFormData({
        studentId,
        groupId,
        paymentPeriod: '',
        type: 1,
        originalAmount: 0,
        discountPercentage: 0,
        discountReason: '',
        periodStart: new Date().toISOString().split('T')[0], // Текущая дата
        periodEnd: ''
      });
      setDisplayValues({
        originalAmount: '',
        discountPercentage: ''
      });
    }

    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'originalAmount') {
      setDisplayValues(prev => ({ ...prev, originalAmount: value }));
      setFormData(prev => ({
        ...prev,
        originalAmount: value === '' ? 0 : Number(value)
      }));
    } else if (name === 'discountPercentage') {
      setDisplayValues(prev => ({ ...prev, discountPercentage: value }));
      setFormData(prev => ({
        ...prev,
        discountPercentage: value === '' ? 0 : Number(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'type' ? Number(value) : value
      }));
    }
  };



  // Автоматический расчет итоговой суммы
  const finalAmount = formData.originalAmount * (1 - (formData.discountPercentage || 0) / 100);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Создать платеж
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {studentName} • {groupName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loadingUser ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Загрузка данных студента...</span>
            </div>
          ) : (
            <>
              {/* User Info */}
              {userData && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Информация о студенте
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Телефон:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{userData.phone}</span>
                    </div>
                    {groupPrice && groupPrice > 0 && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Цена группы:</span>
                        <span className="ml-2 text-green-600 dark:text-green-400 font-semibold">
                          {groupPrice.toLocaleString()} тенге
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Payment Period */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Период платежа *
                    </label>
                    <input
                      type="text"
                      name="paymentPeriod"
                      value={formData.paymentPeriod}
                      onChange={handleInputChange}
                      placeholder="Например: Ноябрь 2025"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Payment Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Тип платежа *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={1}>Ежемесячный</option>
                      <option value={2}>Разовый</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Period Start */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Начало периода *
                    </label>
                    <input
                      type="date"
                      name="periodStart"
                      value={formData.periodStart}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Period End */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Конец периода *
                    </label>
                    <input
                      type="date"
                      name="periodEnd"
                      value={formData.periodEnd}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Original Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Первоначальная сумма *
                    </label>
                    <input
                      type="number"
                      name="originalAmount"
                      value={displayValues.originalAmount}
                      onChange={handleInputChange}
                      placeholder="Введите сумму"
                      min="0"
                      step="0.01"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Discount Percentage */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Скидка (%)
                    </label>
                    <input
                      type="number"
                      name="discountPercentage"
                      value={displayValues.discountPercentage}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Discount Reason */}
                {(formData.discountPercentage || 0) > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Причина скидки
                    </label>
                    <textarea
                      name="discountReason"
                      value={formData.discountReason}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Укажите причину предоставления скидки"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none max-h-32"
                    />
                  </div>
                )}

                {/* Final Amount Display */}
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Итоговая сумма к оплате:
                    </span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {finalAmount.toLocaleString()} ₸
                    </span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors flex items-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Создание...
                      </>
                    ) : (
                      'Создать платеж'
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};