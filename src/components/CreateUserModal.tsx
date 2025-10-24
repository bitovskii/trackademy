'use client';

import React, { useState } from 'react';
import { XMarkIcon, UserPlusIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: CreateUserData) => void;
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

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onSave }) => {
  const { user } = useAuth();
  
  // Phone formatting functions
  const formatPhoneDisplay = (value: string): string => {
    // Remove all non-digits except +
    const cleaned = value.replace(/[^\d+]/g, '');
    
    // If starts with +7, format as +7 (XXX) XXX-XXXX
    if (cleaned.startsWith('+7')) {
      const digits = cleaned.slice(2); // Remove +7
      if (digits.length <= 3) {
        return `+7 (${digits}`;
      } else if (digits.length <= 6) {
        return `+7 (${digits.slice(0, 3)}) ${digits.slice(3)}`;
      } else {
        return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
      }
    }
    
    // If starts with 7, add + and format
    if (cleaned.startsWith('7')) {
      const digits = cleaned.slice(1);
      if (digits.length <= 3) {
        return `+7 (${digits}`;
      } else if (digits.length <= 6) {
        return `+7 (${digits.slice(0, 3)}) ${digits.slice(3)}`;
      } else {
        return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
      }
    }
    
    // If no 7, assume Russian number and add +7
    if (cleaned.length > 0 && !cleaned.startsWith('+')) {
      const digits = cleaned;
      if (digits.length <= 3) {
        return `+7 (${digits}`;
      } else if (digits.length <= 6) {
        return `+7 (${digits.slice(0, 3)}) ${digits.slice(3)}`;
      } else {
        return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
      }
    }
    
    return cleaned;
  };

  const formatPhoneForAPI = (value: string): string => {
    // Remove all non-digits except +
    const cleaned = value.replace(/[^\d+]/g, '');
    
    // Ensure it starts with +7
    if (cleaned.startsWith('+7')) {
      return cleaned;
    } else if (cleaned.startsWith('7')) {
      return '+' + cleaned;
    } else if (cleaned.length > 0) {
      return '+7' + cleaned;
    }
    
    return cleaned;
  };

  const [formData, setFormData] = useState<CreateUserData>({
    login: '',
    fullName: '',
    email: '',
    password: '',
    phone: '',
    parentPhone: '',
    birthday: '',
    role: 1, // Default to Student
    organizationId: user?.organizationId || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Role options - only Student and Teacher
  const roleOptions = [
    { value: 1, label: 'Студент', icon: '🎓', color: 'from-green-400 to-emerald-500' },
    { value: 3, label: 'Преподаватель', icon: '👨‍🏫', color: 'from-blue-400 to-cyan-500' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone' || name === 'parentPhone') {
      // Format phone display
      const formatted = formatPhoneDisplay(value);
      setFormData(prev => ({
        ...prev,
        [name]: formatted
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'role' ? parseInt(value, 10) : value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.login.trim()) newErrors.login = 'Логин обязателен';
    if (!formData.fullName.trim()) newErrors.fullName = 'Полное имя обязательно';
    if (!formData.email.trim()) newErrors.email = 'Email обязателен';
    if (!formData.password.trim()) newErrors.password = 'Пароль обязателен';
    if (!formData.phone.trim()) newErrors.phone = 'Телефон обязателен';

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный формат email';
    }

    // Password validation
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Prepare data for API
      const apiData: CreateUserData = {
        ...formData,
        phone: formatPhoneForAPI(formData.phone),
        parentPhone: formData.parentPhone ? formatPhoneForAPI(formData.parentPhone) : undefined,
        organizationId: user?.organizationId || formData.organizationId
      };

      // Remove empty optional fields
      if (!apiData.parentPhone?.trim()) {
        delete apiData.parentPhone;
      }
      if (!apiData.birthday?.trim()) {
        delete apiData.birthday;
      }

      await onSave(apiData);
      
      // Reset form on success
      setFormData({
        login: '',
        fullName: '',
        email: '',
        password: '',
        phone: '',
        parentPhone: '',
        birthday: '',
        role: 1,
        organizationId: user?.organizationId || ''
      });
      setErrors({});
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      login: '',
      fullName: '',
      email: '',
      password: '',
      phone: '',
      parentPhone: '',
      birthday: '',
      role: 1,
      organizationId: user?.organizationId || ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[70vh] overflow-hidden">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-r from-primary to-secondary p-2 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                <UserPlusIcon className="w-3 h-3" />
              </div>
              <div>
                <h2 className="text-sm font-bold">Добавить пользователя</h2>
                <p className="text-white/80 text-xs">Создайте новый аккаунт в системе</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-5 h-5 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
            >
              <XMarkIcon className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-2 max-h-[calc(70vh-60px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-2">
            {/* Role Selection - Beautiful Cards */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Роль пользователя *
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {roleOptions.map(option => (
                  <div
                    key={option.value}
                    onClick={() => setFormData(prev => ({ ...prev, role: option.value }))}
                    className={`relative p-2 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.role === option.value
                        ? 'border-primary bg-primary/10 shadow-md scale-105'
                        : 'border-gray-200 dark:border-gray-600 hover:border-primary/50 hover:shadow-sm'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-lg bg-gradient-to-r ${option.color} flex items-center justify-center mb-1.5`}>
                      <span className="text-white text-sm">{option.icon}</span>
                    </div>
                    <div className={`text-xs font-medium transition-colors ${
                      formData.role === option.value 
                        ? 'text-primary font-semibold' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {option.label}
                    </div>
                    {formData.role === option.value && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-1">
                Личная информация
              </h3>
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Полное имя *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`w-full px-2 py-1.5 border-2 rounded-lg focus:ring-0 focus:border-primary transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm ${
                    errors.fullName ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="Введите полное имя"
                />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
              </div>

              {/* Birthday (optional) */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Дата рождения
                </label>
                <input
                  type="date"
                  name="birthday"
                  value={formData.birthday}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1.5 border-2 border-gray-200 rounded-lg focus:ring-0 focus:border-primary transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-1">
                Контактная информация
              </h3>
              
              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-2 py-1.5 border-2 rounded-lg focus:ring-0 focus:border-primary transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm ${
                    errors.email ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="example@email.com"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Телефон *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-2 py-1.5 border-2 rounded-lg focus:ring-0 focus:border-primary transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm ${
                    errors.phone ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="+7 (999) 123-4567"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              {/* Parent Phone (optional) */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Телефон родителя
                </label>
                <input
                  type="tel"
                  name="parentPhone"
                  value={formData.parentPhone}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1.5 border-2 border-gray-200 rounded-lg focus:ring-0 focus:border-primary transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                  placeholder="+7 (999) 123-4567 (необязательно)"
                />
              </div>
            </div>

            {/* Account Information */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-1">
                Данные для входа
              </h3>
              
              {/* Login */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Логин *
                </label>
                <input
                  type="text"
                  name="login"
                  value={formData.login}
                  onChange={handleInputChange}
                  className={`w-full px-2 py-1.5 border-2 rounded-lg focus:ring-0 focus:border-primary transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm ${
                    errors.login ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="Логин для входа в систему"
                />
                {errors.login && <p className="text-red-500 text-xs mt-1">{errors.login}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Пароль *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-2 py-1.5 pr-8 border-2 rounded-lg focus:ring-0 focus:border-primary transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm ${
                      errors.password ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="Минимум 6 символов"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeSlashIcon className="w-3 h-3" /> : <EyeIcon className="w-3 h-3" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
            </div>

            {/* Form Buttons */}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-600 flex space-x-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-3 py-1.5 border-2 border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors font-medium text-xs"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-3 py-1.5 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center space-x-1 text-xs"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Создание...</span>
                  </>
                ) : (
                  <>
                    <UserPlusIcon className="w-3 h-3" />
                    <span>Создать пользователя</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateUserModal;
