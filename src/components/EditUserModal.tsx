'use client';

import React, { useState, useEffect } from 'react';
import { User, UserFormData } from '../types/User';
import { UserIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { BaseModal } from './ui/BaseModal';
import { FormField, FormLabel, FormInput, FormError } from './ui/FormField';
import { ActionButtons } from './ui/ActionButtons';
import { RoleSelection } from './ui/RoleSelection';
import { usePhoneFormatter } from '../hooks/usePhoneFormatter';

interface EditUserModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (id: string, data: UserFormData) => Promise<void>;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  user,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    login: '',
    fullName: '',
    email: '',
    phone: '',
    parentPhone: '',
    birthday: '',
    role: 1, // Default to student role
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { formatPhoneDisplay, formatPhoneForApi, handlePhoneKeyDown } = usePhoneFormatter();

  // Role options - only Student and Teacher  
  const roleOptions = [
    { value: 1, label: 'Студент', icon: '🎓', color: 'from-green-400 to-emerald-500' },
    { value: 3, label: 'Преподаватель', icon: '👨‍🏫', color: 'from-blue-400 to-cyan-500' }
  ];

  const handleRoleChange = (role: number) => {
    setFormData(prev => ({ ...prev, role }));
    if (errors.role) {
      setErrors(prev => ({ ...prev, role: '' }));
    }
  };

  useEffect(() => {
    if (user) {
      setFormData({
        login: user.login,
        fullName: user.name,
        email: user.email,
        phone: user.phone,
        parentPhone: user.parentPhone || '',
        birthday: user.birthday || '',
        role: user.role,
      });
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.login.trim()) newErrors.login = 'Логин обязателен';
    if (!formData.fullName.trim()) newErrors.fullName = 'Полное имя обязательно';
    if (!formData.email.trim()) newErrors.email = 'Email обязателен';
    if (!formData.phone.trim()) newErrors.phone = 'Телефон обязателен';

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный формат email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !validateForm()) return;

    setIsSubmitting(true);

    try {
      // Format phone numbers for API
      const apiFormData = {
        ...formData,
        phone: formatPhoneForApi(formData.phone),
        parentPhone: formData.parentPhone ? formatPhoneForApi(formData.parentPhone) : ''
      };
      
      await onSave(user.id, apiFormData);
      handleClose();
    } catch (err) {
      setErrors({ general: 'Не удалось обновить пользователя. Попробуйте еще раз.' });
      console.error('Error updating user:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone' || name === 'parentPhone') {
      const formatted = formatPhoneDisplay(value);
      setFormData(prev => ({
        ...prev,
        [name]: formatted
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleClose = () => {
    setFormData({
      login: '',
      fullName: '',
      email: '',
      phone: '',
      parentPhone: '',
      birthday: '',
      role: 1,
    });
    setErrors({});
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Редактировать пользователя"
      subtitle="Обновите информацию о пользователе"
      icon={<UserIcon className="w-3 h-3" />}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-2">
        {/* General Error */}
        {errors.general && (
          <div className="error-message">
            {errors.general}
          </div>
        )}

        {/* Login Field */}
        <FormField>
          <FormLabel htmlFor="login" required>
            Логин
          </FormLabel>
          <FormInput
            id="login"
            name="login"
            type="text"
            value={formData.login}
            onChange={handleInputChange}
            placeholder="Введите логин"
            error={errors.login}
          />
          <FormError error={errors.login} />
        </FormField>

        {/* Name Field */}
        <FormField>
          <FormLabel htmlFor="name" required>
            Полное имя
          </FormLabel>
          <FormInput
            id="fullName"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="Введите полное имя"
            error={errors.fullName}
          />
          <FormError error={errors.fullName} />
        </FormField>

        {/* Email Field */}
        <FormField>
          <FormLabel htmlFor="email" required>
            Email
          </FormLabel>
          <FormInput
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="example@domain.com"
            error={errors.email}
          />
          <FormError error={errors.email} />
        </FormField>

        {/* Phone Field */}
        <FormField>
          <FormLabel htmlFor="phone" required>
            Телефон
          </FormLabel>
          <FormInput
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            onKeyDown={handlePhoneKeyDown}
            placeholder="+7 (999) 999-99-99"
            error={errors.phone}
            maxLength={18}
          />
          <FormError error={errors.phone} />
        </FormField>

        {/* Parent Phone Field */}
        <FormField>
          <FormLabel htmlFor="parentPhone">
            Телефон родителя
          </FormLabel>
          <FormInput
            id="parentPhone"
            name="parentPhone"
            type="tel"
            value={formData.parentPhone}
            onChange={handleInputChange}
            onKeyDown={handlePhoneKeyDown}
            placeholder="+7 (999) 999-99-99"
            maxLength={18}
          />
        </FormField>

        {/* Birthday Field */}
        <FormField>
          <FormLabel htmlFor="birthday">
            Дата рождения
          </FormLabel>
          <FormInput
            id="birthday"
            name="birthday"
            type="date"
            value={formData.birthday}
            onChange={handleInputChange}
          />
        </FormField>

        {/* Role Selection */}
        <RoleSelection
          selectedRole={formData.role}
          onRoleChange={handleRoleChange}
          options={roleOptions}
          error={errors.role}
        />

        {/* Action Buttons */}
        <ActionButtons
          onCancel={handleClose}
          submitText="Сохранить изменения"
          isSubmitting={isSubmitting}
          loadingText="Сохранение..."
        />
      </form>
    </BaseModal>
  );
};

export default EditUserModal;
