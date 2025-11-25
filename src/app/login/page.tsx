'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon, AcademicCapIcon, MagnifyingGlassIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface Organization {
  id: string;
  name: string;
}

export default function LoginPage() {
  const { loginWithCredentials, isAuthenticated } = useAuth();
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
  const [mounted, setMounted] = useState(false);
  const [organizationSearch, setOrganizationSearch] = useState('');
  const [isOrganizationDropdownOpen, setIsOrganizationDropdownOpen] = useState(false);
  const organizationDropdownRef = useRef<HTMLDivElement>(null);

  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      globalThis.location.href = '/';
      return;
    }
  }, [isAuthenticated]);

  // Pre-fill login and organizationId if available in localStorage
  useEffect(() => {
    setMounted(true);
    setIsVisible(true);
    
    if (typeof window !== 'undefined') {
      const savedLogin = localStorage.getItem('userLogin');
      const savedOrgId = localStorage.getItem('userOrganizationId');
      
      if (savedLogin) {
        setFormData(prev => ({ 
          ...prev, 
          login: savedLogin,
          organizationId: savedOrgId || ''
        }));
      }
    }
    
    // Fetch organizations for dropdown
    fetchOrganizations();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (organizationDropdownRef.current && !organizationDropdownRef.current.contains(event.target as Node)) {
        setIsOrganizationDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('https://trackademy.kz/api/Organization');
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

  const handleOrganizationSelect = (orgId: string) => {
    setFormData(prev => ({ ...prev, organizationId: orgId }));
    setIsOrganizationDropdownOpen(false);
    setOrganizationSearch('');
  };

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(organizationSearch.toLowerCase())
  );

  const selectedOrganization = organizations.find(org => org.id === formData.organizationId);

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

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 transition-all duration-500">
      
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 opacity-10 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-500 opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 opacity-5 blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className={`max-w-md w-full space-y-8 relative z-10 transition-all duration-1000 ${isVisible ? 'animate-slide-in-up' : 'opacity-0'}`}>
        {/* Header */}
        <div className="text-center animate-fade-in mb-8">
          <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-3xl mb-6 bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl">
            <AcademicCapIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold mb-3 text-gray-900 dark:text-white">
            Добро пожаловать
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Войдите в Trackademy для продолжения
          </p>
        </div>
        
        {/* Login Form */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 animate-scale-in animate-delay-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-800 animate-fade-in">
                <div className="flex items-center gap-2">
                  <span className="text-red-500">⚠️</span>
                  {error}
                </div>
              </div>
            )}

            {/* Login Field */}
            <div className="animate-fade-in animate-delay-300">
              <label htmlFor="login" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Логин
              </label>
              <input
                id="login"
                name="login"
                type="text"
                required
                value={formData.login}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                placeholder="Введите ваш логин"
              />
            </div>

            {/* Password Field */}
            <div className="animate-fade-in animate-delay-400">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                  className="w-full px-4 py-3 pr-12 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  placeholder="Введите ваш пароль"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
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
            <div className="animate-fade-in animate-delay-500" ref={organizationDropdownRef}>
              <label htmlFor="organizationId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Организация
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsOrganizationDropdownOpen(!isOrganizationDropdownOpen)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 text-gray-900 dark:text-white transition-all duration-200 text-left flex items-center justify-between"
                >
                  <span className={selectedOrganization ? '' : 'text-gray-500 dark:text-gray-400'}>
                    {selectedOrganization ? selectedOrganization.name : 'Выберите организацию'}
                  </span>
                  <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isOrganizationDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOrganizationDropdownOpen && (
                  <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-xl max-h-80 overflow-hidden">
                    {/* Search Input */}
                    <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                      <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={organizationSearch}
                          onChange={(e) => setOrganizationSearch(e.target.value)}
                          placeholder="Поиск организации..."
                          className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Organization List */}
                    <div className="max-h-60 overflow-y-auto">
                      {filteredOrganizations.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          Организации не найдены
                        </div>
                      ) : (
                        filteredOrganizations.map((org) => (
                          <button
                            key={org.id}
                            type="button"
                            onClick={() => handleOrganizationSelect(org.id)}
                            className={`w-full px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${
                              formData.organizationId === org.id
                                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                                : 'text-gray-900 dark:text-white'
                            }`}
                          >
                            {org.name}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="animate-fade-in animate-delay-500 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Вход...
                  </>
                ) : (
                  <>
                    <AcademicCapIcon className="w-5 h-5" />
                    Войти в систему
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
