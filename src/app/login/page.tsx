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
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl mb-6 shadow-xl hover-lift"
               style={{ background: 'var(--gradient-cool)' }}>
            <AcademicCapIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-2">
            <span className="gradient-text">Добро пожаловать</span>
          </h2>
          <p style={{ color: 'var(--muted-foreground)' }}>
            Войдите в TrackAcademy для продолжения
          </p>
          <div className="mt-4">
            <Link href="/" className="text-sm hover:underline transition-all duration-300"
                  style={{ color: 'var(--primary)' }}>
              ← Вернуться на главную
            </Link>
          </div>
        </div>
        
        {/* Login Form */}
        <div className="card glass-card">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 rounded-lg border animate-slide-in-right"
                   style={{ 
                     background: 'rgba(239, 68, 68, 0.1)',
                     borderColor: 'var(--secondary)',
                     color: 'var(--secondary)'
                   }}>
                {error}
              </div>
            )}

            {/* Login Field */}
            <div className="space-y-2">
              <label htmlFor="login" className="block text-sm font-medium"
                     style={{ color: 'var(--foreground)' }}>
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
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium"
                     style={{ color: 'var(--foreground)' }}>
                Пароль
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pr-12"
                  placeholder="Введите ваш пароль"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors duration-300"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 hover:scale-110 transition-transform" />
                  ) : (
                    <EyeIcon className="h-5 w-5 hover:scale-110 transition-transform" />
                  )}
                </button>
              </div>
            </div>

            {/* Organization Selection */}
            <div className="space-y-2">
              <label htmlFor="organizationId" className="block text-sm font-medium"
                     style={{ color: 'var(--foreground)' }}>
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
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Вход...
                  </>
                ) : (
                  'Войти в систему'
                )}
              </button>
            </div>

            {/* Additional Links */}
            <div className="text-center space-y-2">
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
        <div className={`grid grid-cols-2 gap-4 transition-all duration-1000 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}
             style={{ animationDelay: '0.5s' }}>
          <div className="text-center p-3 rounded-lg hover-lift"
               style={{ background: 'var(--muted)' }}>
            <BuildingOfficeIcon className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--primary)' }} />
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Управление организациями</p>
          </div>
          <div className="text-center p-3 rounded-lg hover-lift"
               style={{ background: 'var(--muted)' }}>
            <UserGroupIcon className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--primary)' }} />
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Работа со студентами</p>
          </div>
        </div>
      </div>
    </div>
  );
}
