'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthenticatedApiService } from '../../services/AuthenticatedApiService';
import { UserIcon, EnvelopeIcon, BuildingOfficeIcon, IdentificationIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface ProfileData {
  id: string;
  login: string;
  fullName: string;
  email: string;
  role: string;
  organizationId: string;
  organizationNames: string;
}

interface Organization {
  id: string;
  name: string;
  phone: string;
  address: string;
}

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [organizationData, setOrganizationData] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfileData();
    }
  }, [isAuthenticated]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await AuthenticatedApiService.get<ProfileData>('/Auth/me');
      setProfileData(data);
      
      // Fetch organization details if organizationId exists
      if (data.organizationId) {
        try {
          const orgData = await AuthenticatedApiService.get<Organization>(`/Organization/${data.organizationId}`);
          setOrganizationData(orgData);
        } catch (orgError) {
          console.error('Failed to fetch organization data:', orgError);
          // Don't fail the whole page if organization fetch fails
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
      setError('Не удалось загрузить данные профиля');
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = (role: string | number) => {
    // Convert number to string if needed
    const roleStr = typeof role === 'number' ? role.toString() : role;
    
    switch (roleStr) {
      case 'Administrator':
      case '2':
        return 'Администратор';
      case 'Teacher':
      case '3':
        return 'Преподаватель';
      case 'Student':
      case '1':
        return 'Студент';
      default:
        return roleStr;
    }
  };

  const getRoleBadgeColor = (role: string | number) => {
    // Convert number to string if needed
    const roleStr = typeof role === 'number' ? role.toString() : role;
    
    switch (roleStr) {
      case 'Administrator':
      case '2':
        return 'bg-red-100 text-red-800';
      case 'Teacher':
      case '3':
        return 'bg-blue-100 text-blue-800';
      case 'Student':
      case '1':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Требуется авторизация</h3>
          <p className="mt-1 text-sm text-gray-500">
            Войдите в систему для просмотра профиля
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-500">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            <p className="font-medium">Ошибка загрузки</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={fetchProfileData}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    );
  }

  const displayData = profileData || user;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Профиль пользователя</h1>
          <p className="mt-1 text-sm text-gray-500">
            Информация о вашем аккаунте и организации
          </p>
        </div>

        {/* Profile Content */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-gray-400" />
                Личная информация
              </h2>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Полное имя</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 rounded-md px-3 py-2">
                    {displayData?.fullName || 'Не указано'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Логин</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 rounded-md px-3 py-2 flex items-center">
                    <IdentificationIcon className="h-4 w-4 mr-2 text-gray-400" />
                    {displayData?.login || 'Не указано'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 rounded-md px-3 py-2 flex items-center">
                    <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                    {displayData?.email || 'Не указано'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Роль</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(displayData?.role || '')}`}>
                      <ShieldCheckIcon className="h-3 w-3 mr-1" />
                      {getRoleDisplayName(displayData?.role || '')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Organization Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <BuildingOfficeIcon className="h-5 w-5 mr-2 text-gray-400" />
                Организация
              </h2>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Название организации</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 rounded-md px-3 py-2">
                    {organizationData?.name || displayData?.organizationNames || 'Не указано'}
                  </p>
                </div>

                {organizationData && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Телефон организации</label>
                      <p className="mt-1 text-sm text-gray-900 bg-gray-50 rounded-md px-3 py-2">
                        {organizationData.phone || 'Не указано'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Адрес организации</label>
                      <p className="mt-1 text-sm text-gray-900 bg-gray-50 rounded-md px-3 py-2">
                        {organizationData.address || 'Не указано'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Последнее обновление</h3>
                <p className="text-sm text-gray-500">{new Date().toLocaleString('ru-RU')}</p>
              </div>
              <button
                onClick={fetchProfileData}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Обновить данные
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}