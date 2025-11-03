'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  AcademicCapIcon, 
  UserGroupIcon, 
  BookOpenIcon, 
  CalendarDaysIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useApiToast } from '../hooks/useApiToast';
import { DashboardApiService } from '../services/DashboardApiService';
import { DashboardSummary, DashboardStats } from '../types/Dashboard';
import { StatsCard } from '../components/dashboard/StatsCard';
import { PageHeaderWithStats } from '../components/ui/PageHeaderWithStats';
import Link from 'next/link';

export default function Dashboard() {
  const { isAuthenticated, user } = useAuth();
  const { loadOperation } = useApiToast();
  
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузка данных аналитики
  const loadDashboardData = useCallback(async () => {
    if (!isAuthenticated || !user?.organizationId) {
      return;
    }

    const currentFilters = {
      organizationId: user.organizationId
    };

    setLoading(true);
    try {
      const result = await DashboardApiService.getSummary(currentFilters);
      setSummary(result);
      setError(null);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.organizationId]);

  useEffect(() => {
    if (isAuthenticated && user?.organizationId) {
      loadDashboardData();
    }
  }, [isAuthenticated, user?.organizationId, loadDashboardData]);

  // Подготовка статистики
  const stats: DashboardStats[] = summary ? [
    {
      label: 'Всего студентов',
      value: summary.totalStudents,
      icon: AcademicCapIcon,
      color: 'blue',
      description: `Активных: ${summary.activeStudents}`
    },
    {
      label: 'Группы',
      value: summary.totalGroups,
      icon: UserGroupIcon,
      color: 'green',
      description: `Активных: ${summary.activeGroups}`
    },
    {
      label: 'Уроки сегодня',
      value: summary.lessonsToday,
      icon: CalendarDaysIcon,
      color: 'purple',
      description: `Завершено: ${summary.completedLessonsToday}`
    },
    {
      label: 'Посещаемость',
      value: `${summary.averageAttendanceRate}%`,
      icon: ChartBarIcon,
      color: summary.averageAttendanceRate >= 80 ? 'green' : summary.averageAttendanceRate >= 60 ? 'yellow' : 'red'
    },
    {
      label: 'Неоплаченные',
      value: summary.unpaidStudentsCount,
      icon: CurrencyDollarIcon,
      color: summary.unpaidStudentsCount > 0 ? 'red' : 'green',
      description: `Общий долг: ${summary.totalDebt}₸`
    },
    {
      label: 'Пробный период',
      value: summary.trialStudentsCount,
      icon: ClockIcon,
      color: 'orange'
    },
    {
      label: 'Проблемные группы',
      value: summary.lowPerformanceGroupsCount,
      icon: ExclamationTriangleIcon,
      color: summary.lowPerformanceGroupsCount > 0 ? 'red' : 'green'
    }
  ] : [];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-6 py-6 mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 max-w-md">
              <div className="text-blue-500 text-4xl mb-4">🔒</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Требуется авторизация
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Войдите в систему для просмотра аналитики
              </p>
              <Link
                href="/login"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 
                         text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all 
                         duration-200 transform hover:-translate-y-0.5"
              >
                Войти в систему
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-6 py-6 mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-red-200 dark:border-red-700 p-8 max-w-md">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Ошибка загрузки
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
              <button
                onClick={loadDashboardData}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Попробовать снова
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 md:px-6 py-4 md:py-6 pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <PageHeaderWithStats
          title="Аналитика"
          subtitle="Обзор ключевых показателей системы"
          icon={ChartBarIcon}
          gradientFrom="blue-500"
          gradientTo="purple-600"
          stats={[
            { label: "Всего студентов", value: summary?.totalStudents || 0, color: "blue" },
            { label: "Активные группы", value: summary?.activeGroups || 0, color: "green" },
            { label: "Посещаемость", value: `${summary?.averageAttendanceRate || 0}%`, color: "purple" }
          ]}
        />

        {/* Stats Grid */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <StatsCard key={index} stat={stat} />
            ))}
          </div>
        )}

        {/* Last Updated */}
        {summary && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Последнее обновление: {new Date(summary.lastUpdated).toLocaleString('ru-RU')}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && !summary && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Загрузка данных аналитики...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
