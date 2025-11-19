'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon, ExclamationTriangleIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { ImportError } from '../types/User';
import { PhoneInput } from './ui/PhoneInput';
import { PasswordInput } from './ui/PasswordInput';

interface FixImportErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorData: ImportError | null;
  onCreateUser: (userData: {
    login: string;
    fullName: string;
    password: string;
    phone: string;
    parentPhone: string;
    birthday: string;
    role: number;
    organizationId: string;
    isTrial: boolean;
  }) => Promise<void>;
  organizationId: string;
}

export const FixImportErrorModal: React.FC<FixImportErrorModalProps> = ({
  isOpen,
  onClose,
  errorData,
  onCreateUser,
  organizationId
}) => {
  const [formData, setFormData] = useState({
    login: '',
    fullName: '',
    password: '',
    phone: '',
    parentPhone: '',
    birthday: '',
    role: 1,
    isTrial: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (errorData && isOpen) {
      // Генерируем логин из полного имени
      const generateLogin = (fullName: string) => {
        const parts = fullName.trim().split(' ');
        if (parts.length >= 2) {
          const lastName = parts[0].toLowerCase();
          const firstInitial = parts[1].charAt(0).toLowerCase();
          return `${lastName}_${firstInitial}`;
        }
        return fullName.toLowerCase().replace(/\s+/g, '_');
      };

      setFormData({
        login: generateLogin(errorData.fullName),
        fullName: errorData.fullName,
        password: '',
        phone: errorData.phone || '',
        parentPhone: '',
        birthday: '',
        role: 1, // Student по умолчанию
        isTrial: false
      });
      setErrors({});
    }
  }, [errorData, isOpen]);

  if (!isOpen || !errorData) return null;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.login.trim()) {
      newErrors.login = 'Логин обязателен';
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'ФИО обязательно';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
    }

    if (formData.phone && !/^\+?[\d\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Некорректный формат телефона';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onCreateUser({
        ...formData,
        organizationId
      });
      onClose();
    } catch (error) {
      console.error('Error creating user:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Ошибка при создании пользователя' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        login: '',
        fullName: '',
        password: '',
        phone: '',
        parentPhone: '',
        birthday: '',
        role: 1,
        isTrial: false
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <UserPlusIcon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">Исправление ошибки импорта</h2>
                <p className="text-white/90 text-sm mt-1">Строка #{errorData.rowNumber} - {errorData.fullName}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-10 h-10 bg-white/20 hover:bg-white/40 hover:scale-110 rounded-lg flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              title="Закрыть"
            >
              <XMarkIcon className="w-6 h-6 text-white" />
            </button>
          </div>
          
          {/* Errors from import */}
          <div className="mt-4 bg-white/10 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-white/90 mb-1">Ошибки при импорте:</p>
                <ul className="space-y-1">
                  {errorData.errors.map((error, index) => (
                    <li key={index} className="text-sm text-white/80 flex items-center gap-2">
                      <span className="w-1 h-1 bg-white/60 rounded-full"></span>
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          <div className="space-y-4">
            {/* Login */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Логин <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.login}
                onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.login ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Введите логин"
                disabled={isSubmitting}
              />
              {errors.login && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.login}</p>
              )}
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ФИО <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.fullName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Введите ФИО"
                disabled={isSubmitting}
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fullName}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Пароль <span className="text-red-500">*</span>
              </label>
              <PasswordInput
                value={formData.password}
                onChange={(value) => setFormData({ ...formData, password: value })}
                placeholder="Введите пароль (минимум 6 символов)"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Телефон
              </label>
              <PhoneInput
                value={formData.phone}
                onChange={(value) => setFormData({ ...formData, phone: value })}
                error={errors.phone}
                disabled={isSubmitting}
              />
            </div>

            {/* Parent Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Телефон родителя
              </label>
              <PhoneInput
                value={formData.parentPhone}
                onChange={(value) => setFormData({ ...formData, parentPhone: value })}
                error={errors.parentPhone}
                disabled={isSubmitting}
                placeholder="+7 (___) ___-__-__"
              />
            </div>

            {/* Birthday */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Дата рождения
              </label>
              <input
                type="date"
                value={formData.birthday}
                onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.birthday ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                disabled={isSubmitting}
              />
              {errors.birthday && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.birthday}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Роль
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: Number(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={isSubmitting}
              >
                <option value={1}>Студент</option>
                <option value={2}>Администратор</option>
                <option value={3}>Преподаватель</option>
              </select>
            </div>

            {/* Trial */}
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <span>Пробный период</span>
              </label>
              <div 
                className="relative cursor-pointer"
                onClick={() => !isSubmitting && setFormData({ ...formData, isTrial: !formData.isTrial })}
              >
                <input
                  type="checkbox"
                  checked={formData.isTrial}
                  onChange={(e) => setFormData({ ...formData, isTrial: e.target.checked })}
                  className="sr-only"
                  disabled={isSubmitting}
                />
                <div className={`block w-14 h-8 rounded-full transition-colors duration-200 ease-in-out ${
                  formData.isTrial 
                    ? 'bg-emerald-500' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}>
                  <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-200 ease-in-out transform ${
                    formData.isTrial ? 'translate-x-6' : 'translate-x-0'
                  } shadow-md`}></div>
                </div>
              </div>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <ExclamationTriangleIcon className="w-5 h-5" />
                  <span className="font-medium">{errors.submit}</span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Создание...
                </span>
              ) : (
                'Создать пользователя'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
