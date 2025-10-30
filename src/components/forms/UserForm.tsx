'use client';

import React from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { usePhoneFormatter } from '../../hooks/usePhoneFormatter';

interface UserFormProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  mode: 'create' | 'edit';
}

export const UserForm: React.FC<UserFormProps> = ({
  formData,
  setFormData,
  errors,
  setErrors,
  mode
}) => {
  const { user } = useAuth();
  const { formatPhoneDisplay, handlePhoneKeyDown } = usePhoneFormatter();
  const [showPassword, setShowPassword] = React.useState(false);

  const roleOptions = [
    { value: 1, label: 'Студент' },
    { value: 3, label: 'Преподаватель' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone' || name === 'parentPhone') {
      setFormData((prev: any) => ({
        ...prev,
        [name]: formatPhoneDisplay(value)
      }));
    } else {
      setFormData((prev: any) => ({
        ...prev,
        [name]: name === 'role' ? parseInt(value) : value
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="space-y-6">
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
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
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
                  ? 'text-emerald-700 dark:text-emerald-300' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}>
                {role.label}
              </span>
              {formData.role === role.value && (
                <div className="absolute top-2 right-2 w-3 h-3 bg-emerald-500 rounded-full"></div>
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
            value={formData.login || ''}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors ${
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
            value={formData.fullName || ''}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors ${
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
            value={formData.email || ''}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors ${
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

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Пароль {mode === 'create' ? '*' : '(оставить пустым для сохранения текущего)'}
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password || ''}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors ${
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
            value={formData.phone || ''}
            onChange={handleInputChange}
            onKeyDown={handlePhoneKeyDown}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors ${
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
              value={formData.parentPhone || ''}
              onChange={handleInputChange}
              onKeyDown={handlePhoneKeyDown}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors ${
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
            value={formData.birthday || ''}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>
    </div>
  );
};