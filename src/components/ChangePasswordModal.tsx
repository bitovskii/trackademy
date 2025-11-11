'use client';

import React, { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import { BaseModal } from './ui/BaseModal';
import { useAuth } from '../contexts/AuthContext';
import { AuthenticatedApiService } from '../services/AuthenticatedApiService';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Сбрасываем форму при открытии модалки
  React.useEffect(() => {
    if (isOpen) {
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswords({ current: false, new: false, confirm: false });
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.currentPassword.trim() || !formData.newPassword.trim() || !formData.confirmPassword.trim()) {
      showToast('Пожалуйста, заполните все поля', 'error');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showToast('Новые пароли не совпадают', 'error');
      return;
    }

    if (formData.newPassword.length < 6) {
      showToast('Новый пароль должен содержать минимум 6 символов', 'error');
      return;
    }

    if (!user?.id) {
      showToast('Не удалось определить пользователя', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await AuthenticatedApiService.changePassword(
        user.id,
        formData.currentPassword,
        formData.newPassword
      );
      
      // Если мы дошли до этой строки без ошибки, значит пароль успешно изменен
      // Сбрасываем форму
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      // Сбрасываем видимость паролей
      setShowPasswords({ current: false, new: false, confirm: false });
      // Показываем успешное уведомление
      showToast('Пароль успешно изменен', 'success');
      // Закрываем модалку с небольшой задержкой, чтобы пользователь увидел успешное уведомление
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Password change error:', error);
      const errorMessage = (error as { message?: string })?.message || 'Ошибка при смене пароля';
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    onClose();
  };

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="Смена пароля"
      customBackground="bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Текущий пароль */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Текущий пароль <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPasswords.current ? "text" : "password"}
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              className="w-full px-4 py-3 pr-12 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-white shadow-sm transition-all duration-200 hover:shadow-md"
              required
            />
            <button
              type="button"
              onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {showPasswords.current ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

          {/* Новый пароль */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Новый пароль <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                minLength={6}
                className="w-full px-4 py-3 pr-12 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-white shadow-sm transition-all duration-200 hover:shadow-md"
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {showPasswords.new ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center">
              <svg className="h-3 w-3 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Минимум 6 символов
            </p>
          </div>

          {/* Подтверждение пароля */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Подтвердите новый пароль <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-3 pr-12 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-white shadow-sm transition-all duration-200 hover:shadow-md"
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {showPasswords.confirm ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 border border-gray-300/50 dark:border-gray-600/50 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:shadow-md transform hover:scale-[1.02]"
              disabled={isLoading}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] transform"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Изменение...
                </span>
              ) : 'Изменить пароль'}
            </button>
          </div>
        </form>
    </BaseModal>
  );
};

export default ChangePasswordModal;