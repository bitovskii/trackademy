'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { AuthenticatedApiService } from '@/services/AuthenticatedApiService';
import { useToast } from '@/contexts/ToastContext';

interface TeacherWorkHours {
  teacherId: string;
  fullName: string;
  completedLessonsCount: number;
}

interface TeacherWorkHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
}

export default function TeacherWorkHoursModal({ isOpen, onClose, organizationId }: TeacherWorkHoursModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<TeacherWorkHours[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Даты по умолчанию: с 1 числа текущего месяца до сегодня
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [fromDate, setFromDate] = useState(formatDateForInput(firstDayOfMonth));
  const [toDate, setToDate] = useState(formatDateForInput(today));

  useEffect(() => {
    if (isOpen) {
      loadTeacherWorkHours();
    }
  }, [isOpen, fromDate, toDate]);

  const loadTeacherWorkHours = async () => {
    setLoading(true);
    try {
      const data = await AuthenticatedApiService.getTeacherWorkHours(organizationId, fromDate, toDate);
      setTeachers(data);
    } catch (error) {
      console.error('Error loading teacher work hours:', error);
      showToast(error instanceof Error ? error.message : 'Ошибка при загрузке данных', 'error');
    } finally {
      setLoading(false);
    }
  };

  const sortedTeachers = [...teachers].sort((a, b) => {
    if (sortOrder === 'desc') {
      return b.completedLessonsCount - a.completedLessonsCount;
    }
    return a.completedLessonsCount - b.completedLessonsCount;
  });

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
  };

  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
              <AcademicCapIcon className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Учет занятий преподавателей
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Статистика проведенных занятий за период
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Period Selection */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                С даты
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                По дату
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Период: {formatDateForDisplay(fromDate)} - {formatDateForDisplay(toDate)}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            </div>
          ) : teachers.length === 0 ? (
            <div className="text-center py-12">
              <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Нет данных
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                За выбранный период нет преподавателей
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Всего преподавателей: {teachers.length}
                </div>
                <button
                  onClick={toggleSortOrder}
                  className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium"
                >
                  {sortOrder === 'desc' ? '↓ По убыванию' : '↑ По возрастанию'}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        №
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Преподаватель
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300" onClick={toggleSortOrder}>
                        Проведено занятий {sortOrder === 'desc' ? '↓' : '↑'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {sortedTeachers.map((teacher, index) => (
                      <tr key={teacher.teacherId} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                              <AcademicCapIcon className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {teacher.fullName}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium ${
                            teacher.completedLessonsCount === 0
                              ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                              : teacher.completedLessonsCount < 5
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                              : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          }`}>
                            {teacher.completedLessonsCount}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Всего занятий:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {teachers.reduce((sum, t) => sum + t.completedLessonsCount, 0)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
