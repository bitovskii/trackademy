'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon, AcademicCapIcon, BuildingOfficeIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Organization {
  id: string;
  name: string;
}

export default function LoginPage() {
  const { loginWithCredentials } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [formData, setFormData] = useState({
    login: '',
    password: '',
    organizationId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Pre-fill login and organizationId if available in localStorage
  useEffect(() => {
    setIsVisible(true);
    const savedLogin = localStorage.getItem('userLogin');
    const savedOrgId = localStorage.getItem('userOrganizationId');
    
    if (savedLogin) {
      setFormData(prev => ({ 
        ...prev, 
        login: savedLogin,
        organizationId: savedOrgId || ''
      }));
    }
    
    // Fetch organizations for dropdown
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('https://trackademy.onrender.com/api/Organization');
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data);
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await loginWithCredentials(formData.login, formData.password, formData.organizationId);
      
      // Redirect to home page
      globalThis.location.href = '/';
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Ошибка входа. Попробуйте еще раз.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gray-50">
      
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full opacity-10 animate-float" 
             style={{ background: 'var(--gradient-cool)' }}></div>
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full opacity-10 animate-float" 
             style={{ background: 'var(--gradient-cool)', animationDelay: '1s' }}></div>
      </div>

      <div className={`max-w-md w-full space-y-8 relative z-10 transition-all duration-1000 ${isVisible ? 'animate-slide-in-up' : 'opacity-0'}`}>
        {/* Header */}
        <div className="text-center animate-fade-in">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl mb-6 shadow-2xl hover-lift animate-pulse-glow"
               style={{ background: 'var(--gradient-cool)' }}>
            <AcademicCapIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold mb-3 animate-fade-in animate-delay-100">
            <span className="gradient-text">Добро пожаловать</span>
          </h2>
          <p className="text-lg mb-4 animate-fade-in animate-delay-200" style={{ color: 'var(--muted-foreground)' }}>
            Войдите в TrackAcademy для продолжения
          </p>
          <div className="animate-fade-in animate-delay-300">
            <Link href="/" className="text-sm hover:underline transition-all duration-300 hover:scale-105 inline-block"
                  style={{ color: 'var(--primary)' }}>
              ← Вернуться на главную
            </Link>
          </div>
        </div>
        
        {/* Login Form */}
        <div className="card glass-card animate-scale-in animate-delay-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {/* Login Field */}
            <div className="form-group animate-fade-in animate-delay-300">
              <label htmlFor="login" className="form-label">
                Логин
              </label>
              <input
                id="login"
                name="login"
                type="text"
                required
                value={formData.login}
                onChange={handleChange}
                className="input-field"
                placeholder="Введите ваш логин"
              />
            </div>

            {/* Password Field */}
            <div className="form-group animate-fade-in animate-delay-400">
              <label htmlFor="password" className="form-label">
                Пароль
              </label>
              <div className="password-container">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Введите ваш пароль"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Organization Selection */}
            <div className="form-group animate-fade-in animate-delay-500">
              <label htmlFor="organizationId" className="form-label">
                Организация
              </label>
              <select
                id="organizationId"
                name="organizationId"
                value={formData.organizationId}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Выберите организацию</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <div className="animate-fade-in animate-delay-500">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary animate-pulse-glow"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="loading-spinner mr-2"></div>
                    Вход...
                  </div>
                ) : (
                  'Войти в систему'
                )}
              </button>
            </div>

            {/* Additional Links */}
            <div className="text-center space-y-2 animate-fade-in animate-delay-500">
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Нет аккаунта?{' '}
                <button
                  type="button"
                  onClick={() => {/* Open register modal if needed */}}
                  className="font-medium hover:underline transition-all duration-300"
                  style={{ color: 'var(--primary)' }}
                >
                  Зарегистрироваться
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-2 gap-4 mt-8 animate-fade-in animate-delay-500">
          <div className="text-center p-4 rounded-2xl hover-lift transition-all duration-300 bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <BuildingOfficeIcon className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm font-semibold text-gray-800 mb-1">Управление организациями</p>
            <p className="text-xs text-gray-600">Эффективное управление учебными заведениями</p>
          </div>
          <div className="text-center p-4 rounded-2xl hover-lift transition-all duration-300 bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <UserGroupIcon className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm font-semibold text-gray-800 mb-1">Работа со студентами</p>
            <p className="text-xs text-gray-600">Контроль успеваемости и посещаемости</p>
          </div>
        </div>
      </div>
    </div>
  );
}
