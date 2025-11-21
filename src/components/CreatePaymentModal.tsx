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
  subjectId: string;
  onSuccess: () => void;
}

export const CreatePaymentModal: React.FC<CreatePaymentModalProps> = ({
  isOpen,
  onClose,
  studentId,
  studentName,
  groupId,
  groupName,
  subjectId,
  onSuccess
}) => {
  const { createOperation } = useApiToast();
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [subjectPrice, setSubjectPrice] = useState<number | null>(null);
  
  // Вычисляем дату +1 месяц от текущей
  const getDefaultPeriodEnd = () => {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth.toISOString().split('T')[0];
  };
  
  const [formData, setFormData] = useState<CreatePaymentRequest>({
    studentId,
    groupId,
    paymentPeriod: '',
    type: 1, // Ежемесячный по умолчанию
    originalAmount: 0,
    discountType: 1, // Процент по умолчанию
    discountValue: 0,
    discountReason: '',
    periodStart: new Date().toISOString().split('T')[0], // Текущая дата
    periodEnd: getDefaultPeriodEnd() // +1 месяц от текущей даты
  });

  // Для отображения в полях ввода
  const [displayValues, setDisplayValues] = useState({
    originalAmount: '',
    discountValue: ''
  });

  // Загружаем данные пользователя и предмета при открытии модалки
  useEffect(() => {
    if (isOpen && studentId) {
      loadUserData();
      loadSubjectData();
    }
  }, [isOpen, studentId, subjectId]);

  // Автоматически заполняем сумму ценой из предмета при открытии модалки
  useEffect(() => {
    if (isOpen && subjectPrice && subjectPrice > 0) {
      setFormData(prev => ({
        ...prev,
        originalAmount: subjectPrice
      }));
      setDisplayValues(prev => ({
        ...prev,
        originalAmount: subjectPrice.toString()
      }));
    }
  }, [isOpen, subjectPrice]);

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

  const loadSubjectData = async () => {
    try {
      const subject = await UserApiService.get<{ price: number }>(`/Subject/${subjectId}`);
      setSubjectPrice(subject.price);
    } catch (error) {
      console.error('Error loading subject data:', error);
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
        discountType: 1,
        discountValue: 0,
        discountReason: '',
        periodStart: new Date().toISOString().split('T')[0], // Текущая дата
        periodEnd: getDefaultPeriodEnd() // +1 месяц от текущей даты
      });
      setDisplayValues({
        originalAmount: '',
        discountValue: ''
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
    } else if (name === 'discountValue') {
      setDisplayValues(prev => ({ ...prev, discountValue: value }));
      setFormData(prev => ({
        ...prev,
        discountValue: value === '' ? 0 : Number(value)
      }));
    } else if (name === 'discountType') {
      setFormData(prev => ({
        ...prev,
        discountType: Number(value),
        discountValue: 0 // Сбрасываем значение при смене типа
      }));
      setDisplayValues(prev => ({ ...prev, discountValue: '' }));
    } else if (name === 'periodStart') {
      // При изменении начала периода автоматически обновляем конец периода на +1 месяц
      const startDate = new Date(value);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      const newPeriodEnd = endDate.toISOString().split('T')[0];
      
      setFormData(prev => ({
        ...prev,
        periodStart: value,
        periodEnd: newPeriodEnd
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'type' ? Number(value) : value
      }));
    }
  };



  // Автоматический расчет итоговой суммы
  const finalAmount = formData.discountType === 1 
    ? formData.originalAmount * (1 - (formData.discountValue || 0) / 100)  // Процент
    : formData.originalAmount - (formData.discountValue || 0);  // Фиксированная сумма

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
                    {subjectPrice && subjectPrice > 0 && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Цена предмета:</span>
                        <span className="ml-2 text-green-600 dark:text-green-400 font-semibold">
                          {subjectPrice.toLocaleString()} тенге
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

                  {/* Discount Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Тип скидки *
                    </label>
                    <select
                      name="discountType"
                      value={formData.discountType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={1}>Процент (%)</option>
                      <option value={2}>Фиксированная сумма</option>
                    </select>
                  </div>

                  {/* Discount Value */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {formData.discountType === 1 ? 'Скидка (%)' : 'Сумма скидки'}
                    </label>
                    <input
                      type="number"
                      name="discountValue"
                      value={displayValues.discountValue}
                      onChange={handleInputChange}
                      placeholder={formData.discountType === 1 ? '0-100' : '0'}
                      min="0"
                      max={formData.discountType === 1 ? '100' : String(formData.originalAmount)}
                      step={formData.discountType === 1 ? '0.01' : '1'}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Discount Reason */}
                {(formData.discountValue || 0) > 0 && (
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