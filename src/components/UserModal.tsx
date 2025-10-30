'use client';

import React, { useState, useEffect } from 'react';
import { UserPlusIcon, UserIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { Modal } from './ui/Modal';
import { usePhoneFormatter } from '../hooks/usePhoneFormatter';
import { User, UserFormData } from '../types/User';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  user?: User | null;
  onSave: (userData: any, userId?: string) => void | Promise<void>;
}

export interface CreateUserData {
  login: string;
  fullName: string;
  email: string;
  password: string;
  phone: string;
  parentPhone?: string;
  birthday?: string;
  role: number;
  organizationId: string;
}

const UserModal: React.FC<UserModalProps> = ({ 
  isOpen, 
  onClose, 
  mode, 
  user, 
  onSave 
}) => {
  const { user: currentUser } = useAuth();
  const { formatPhoneDisplay, formatPhoneForApi, handlePhoneKeyDown } = usePhoneFormatter();

  const [formData, setFormData] = useState<CreateUserData>({
    login: '',
    fullName: '',
    email: '',
    password: '',
    phone: '',
    parentPhone: '',
    birthday: '',
    role: 1,
    organizationId: currentUser?.organizationId || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Role options - only Student and Teacher
  const roleOptions = [
    { value: 1, label: 'Студент', color: 'emerald' },
    { value: 3, label: 'Преподаватель', color: 'blue' }
  ];

  // Update form data when user changes (for edit mode)
  useEffect(() => {
    if (mode === 'edit' && user) {
      setFormData({
        login: user.login || '',
        fullName: user.name || '',
        email: user.email || '',
        password: '', // Never pre-fill password
        phone: formatPhoneDisplay(user.phone || ''),
        parentPhone: formatPhoneDisplay(user.parentPhone || ''),
        birthday: user.birthday ? user.birthday.split('T')[0] : '',
        role: user.role || 1,
        organizationId: user.organizationId || currentUser?.organizationId || ''
      });
    } else if (mode === 'create') {
      // Reset form for create mode
      setFormData({
        login: '',
        fullName: '',
        email: '',
        password: '',
        phone: '',
        parentPhone: '',
        birthday: '',
        role: 1,
        organizationId: currentUser?.organizationId || ''
      });
    }
  }, [mode, user, formatPhoneDisplay, currentUser?.organizationId]);

  const handleClose = () => {
    if (!isSubmitting) {
      if (mode === 'create') {
        setFormData({
          login: '',
          fullName: '',
          email: '',
          password: '',
          phone: '',
          parentPhone: '',
          birthday: '',
          role: 1,
          organizationId: currentUser?.organizationId || ''
        });
      }
      setErrors({});
      setShowPassword(false);
      onClose();
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.login.trim()) {
      newErrors.login = 'Логин обязателен';
    } else if (formData.login.length < 3) {
      newErrors.login = 'Логин должен содержать минимум 3 символа';
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Полное имя обязательно';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный формат email';
    }

    // Password is required only for create mode
    if (mode === 'create') {
      if (!formData.password) {
        newErrors.password = 'Пароль обязателен';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Пароль должен содержать минимум 6 символов';
      }
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Номер телефона обязателен';
    }

    if (formData.role === 1 && !formData.parentPhone?.trim()) {
      newErrors.parentPhone = 'Номер телефона родителя обязателен для студентов';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      let dataToSubmit: any = {
        ...formData,
        phone: formatPhoneForApi(formData.phone),
        parentPhone: formData.parentPhone ? formatPhoneForApi(formData.parentPhone) : undefined
      };

      // Remove password from edit data if it's empty
      if (mode === 'edit' && !dataToSubmit.password) {
        const { password, ...dataWithoutPassword } = dataToSubmit;
        dataToSubmit = dataWithoutPassword;
      }
      
      if (mode === 'edit' && user) {
        await onSave(dataToSubmit, user.id);
      } else {
        await onSave(dataToSubmit);
      }
      
      handleClose();
    } catch (error) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} user:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone' || name === 'parentPhone') {
      setFormData(prev => ({
        ...prev,
        [name]: formatPhoneDisplay(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'role' ? parseInt(value) : value
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Configuration based on mode
  const config = {
    create: {
      title: 'Добавить пользователя',
      subtitle: 'Создание нового пользователя в системе',
      icon: UserPlusIcon,
      gradientFrom: 'emerald-500',
      gradientTo: 'lime-600',
      submitText: 'Создать пользователя',
      loadingText: 'Создание...',
      focusColor: 'emerald'
    },
    edit: {
      title: 'Редактировать пользователя',
      subtitle: 'Изменение данных пользователя в системе',
      icon: UserIcon,
      gradientFrom: 'blue-500',
      gradientTo: 'indigo-600',
      submitText: 'Сохранить изменения',
      loadingText: 'Сохранение...',
      focusColor: 'blue'
    }
  };

  const currentConfig = config[mode];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={currentConfig.title}
      subtitle={currentConfig.subtitle}
      icon={currentConfig.icon}
      gradientFrom={currentConfig.gradientFrom}
      gradientTo={currentConfig.gradientTo}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Role Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Роль пользователя
          </label>
          <div className="grid grid-cols-2 gap-3">
            {roleOptions.map((role) => (
              <label
                key={role.value}
                className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  formData.role === role.value
                    ? `border-${currentConfig.focusColor}-500 bg-${currentConfig.focusColor}-50 dark:bg-${currentConfig.focusColor}-900/20`
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={role.value}
                  checked={formData.role === role.value}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <span className={`text-sm font-medium ${
                  formData.role === role.value 
                    ? `text-${currentConfig.focusColor}-700 dark:text-${currentConfig.focusColor}-300` 
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {role.label}
                </span>
                {formData.role === role.value && (
                  <div className={`absolute top-2 right-2 w-3 h-3 bg-${currentConfig.focusColor}-500 rounded-full`}></div>
                )}
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Login */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Логин *
            </label>
            <input
              type="text"
              name="login"
              value={formData.login}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-${currentConfig.focusColor}-500 focus:border-transparent transition-colors ${
                errors.login 
                  ? 'border-red-400 bg-red-50 dark:bg-red-900/20' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
              } text-gray-900 dark:text-white`}
              placeholder="Введите логин"
            />
            {errors.login && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.login}</p>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Полное имя *
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-${currentConfig.focusColor}-500 focus:border-transparent transition-colors ${
                errors.fullName 
                  ? 'border-red-400 bg-red-50 dark:bg-red-900/20' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
              } text-gray-900 dark:text-white`}
              placeholder="Введите полное имя"
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fullName}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-${currentConfig.focusColor}-500 focus:border-transparent transition-colors ${
                errors.email 
                  ? 'border-red-400 bg-red-50 dark:bg-red-900/20' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
              } text-gray-900 dark:text-white`}
              placeholder="example@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Password - only show for create mode or if user wants to change it in edit mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Пароль {mode === 'create' ? '*' : '(оставить пустым для сохранения текущего)'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-${currentConfig.focusColor}-500 focus:border-transparent transition-colors ${
                  errors.password 
                    ? 'border-red-400 bg-red-50 dark:bg-red-900/20' 
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                } text-gray-900 dark:text-white`}
                placeholder={mode === 'create' ? 'Введите пароль' : 'Новый пароль (необязательно)'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Телефон *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              onKeyDown={handlePhoneKeyDown}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-${currentConfig.focusColor}-500 focus:border-transparent transition-colors ${
                errors.phone 
                  ? 'border-red-400 bg-red-50 dark:bg-red-900/20' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
              } text-gray-900 dark:text-white`}
              placeholder="+7 (___) ___-__-__"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
            )}
          </div>

          {/* Parent Phone (for students) */}
          {formData.role === 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Телефон родителя *
              </label>
              <input
                type="tel"
                name="parentPhone"
                value={formData.parentPhone}
                onChange={handleInputChange}
                onKeyDown={handlePhoneKeyDown}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-${currentConfig.focusColor}-500 focus:border-transparent transition-colors ${
                  errors.parentPhone 
                    ? 'border-red-400 bg-red-50 dark:bg-red-900/20' 
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                } text-gray-900 dark:text-white`}
                placeholder="+7 (___) ___-__-__"
              />
              {errors.parentPhone && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.parentPhone}</p>
              )}
            </div>
          )}

          {/* Birthday */}
          <div className={formData.role === 1 ? '' : 'md:col-span-2'}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Дата рождения
            </label>
            <input
              type="date"
              name="birthday"
              value={formData.birthday}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-${currentConfig.focusColor}-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className={`px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${currentConfig.focusColor}-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-${currentConfig.gradientFrom} to-${currentConfig.gradientTo} hover:from-${currentConfig.gradientFrom.replace('500', '600')} hover:to-${currentConfig.gradientTo.replace('600', '700')} rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${currentConfig.focusColor}-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg hover:scale-105`}
          >
            {isSubmitting ? currentConfig.loadingText : currentConfig.submitText}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UserModal;