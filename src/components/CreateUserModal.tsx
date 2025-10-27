'use client';

import React, { useState } from 'react';
import { UserPlusIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { BaseModal } from './ui/BaseModal';
import { FormField, FormLabel, FormInput, FormError, PasswordInput } from './ui/FormField';
import { ActionButtons } from './ui/ActionButtons';
import { RoleSelection } from './ui/RoleSelection';
import { usePhoneFormatter } from '../hooks/usePhoneFormatter';

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

  const handleRoleChange = (role: number) => {
    setFormData(prev => ({ ...prev, role }));
    if (errors.role) {
      setErrors(prev => ({ ...prev, role: '' }));
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Format phone numbers for API
      const apiData = {
        ...formData,
        phone: formatPhoneForApi(formData.phone),
        parentPhone: formData.parentPhone ? formatPhoneForApi(formData.parentPhone) : '',
        organizationId: user?.organizationId || formData.organizationId
      };

      await onSave(apiData);
      handleClose();
    } catch (error) {
      setErrors({ general: 'Произошла ошибка при создании пользователя. Попробуйте еще раз.' });
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
    setShowPassword(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Добавить пользователя"
      subtitle="Создайте новый аккаунт в системе"
      icon={<UserPlusIcon className="w-3 h-3" />}
      maxWidth="lg"
      gradientFrom="from-blue-500"
      gradientTo="to-purple-600"
    >
      <form onSubmit={handleSubmit} className="space-y-2">
        {/* General Error */}
        {errors.general && (
          <div className="error-message">
            {errors.general}
          </div>
        )}

        {/* Role Selection */}
        <RoleSelection
          selectedRole={formData.role}
          onRoleChange={handleRoleChange}
          options={roleOptions}
          error={errors.role}
        />

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

        {/* Full Name Field */}
        <FormField>
          <FormLabel htmlFor="fullName" required>
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

        {/* Password Field */}
        <FormField>
          <FormLabel htmlFor="password" required>
            Пароль
          </FormLabel>
          <PasswordInput
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Введите пароль"
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            toggleIcon={showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            error={errors.password}
          />
          <FormError error={errors.password} />
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

        {/* Action Buttons */}
        <ActionButtons
          onCancel={handleClose}
          submitText="Создать пользователя"
          isSubmitting={isSubmitting}
          loadingText="Создание..."
        />
      </form>
    </BaseModal>
  );
};

export default CreateUserModal;