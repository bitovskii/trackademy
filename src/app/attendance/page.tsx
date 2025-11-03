'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import { PageHeaderWithStats } from '@/components/ui/PageHeaderWithStats';
import { attendanceApi } from '@/services/AttendanceApiService';
import { AttendanceRecord, AttendanceFilters, AttendanceStatus, getAttendanceStatusText, getAttendanceStatusColor, getAttendanceStatusIcon } from '@/types/Attendance';
import { useApiToast } from '@/hooks/useApiToast';

export default function AttendancePage() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Toast уведомления для API операций
  const { createOperation, updateOperation, deleteOperation, loadOperation } = useApiToast();
  
  const [loading, setLoading] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<AttendanceFilters>({
    organizationId: user?.organizationId || '',
    pageNumber: 1,
    pageSize: 20
  });

  // Check authorization
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
  }, [user, router]);

  // Load attendance data
  useEffect(() => {
    if (user?.organizationId) {
      loadAttendanceData();
    }
  }, [user?.organizationId, filters]);

  const loadAttendanceData = async () => {
    if (!user?.organizationId) return;

    setLoading(true);
    try {
      const response = await loadOperation(
        () => attendanceApi.getAllAttendances({
          ...filters,
          organizationId: user.organizationId!
        }),
        'данные посещаемости'
      );
      
      setAttendanceRecords(response.items);
      setTotalCount(response.totalCount);
    } catch (error) {
      console.error('Ошибка загрузки данных посещаемости:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (newFilters: Partial<AttendanceFilters>) => {
    setFilters(prev => {
      const updated = { ...prev, ...newFilters, pageNumber: 1 };
      
      // Если мы очищаем дату, удаляем её из фильтров полностью
      if (newFilters.fromDate === '') {
        delete updated.fromDate;
      }
      if (newFilters.toDate === '') {
        delete updated.toDate;
      }
      if (newFilters.studentSearch === '') {
        delete updated.studentSearch;
      }
      if (newFilters.status === undefined || newFilters.status === null) {
        delete updated.status;
      }
      
      return updated;
    });
  };

  const resetFilters = () => {
    setFilters({
      organizationId: user?.organizationId || '',
      pageNumber: 1,
      pageSize: 20
    });
  };

  const getAttendanceStats = () => {
    const attended = attendanceRecords.filter(r => r.status === 1).length;
    const absent = attendanceRecords.filter(r => r.status === 2).length;
    const late = attendanceRecords.filter(r => r.status === 3).length;
    const specialReason = attendanceRecords.filter(r => r.status === 4).length;
    
    const total = attendanceRecords.length;
    const attendancePercentage = total > 0 ? Math.round((attended / total) * 100) : 0;

    return { attended, absent, late, specialReason, total, attendancePercentage };
  };

  if (!user) {
    return null;
  }

  const stats = getAttendanceStats();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeaderWithStats
        title="Посещаемость"
        subtitle="Отслеживание и анализ посещаемости студентов"
        icon={ClipboardDocumentCheckIcon}
        gradientFrom="emerald-500"
        gradientTo="teal-600"
        stats={[
          { 
            label: "Общая посещаемость", 
            value: `${stats.attendancePercentage}%`, 
            color: "emerald" as const
          },
          { 
            label: "Присутствовали", 
            value: stats.attended, 
            color: "green" as const
          },
          { 
            label: "Пропустили", 
            value: stats.absent, 
            color: "red" as const
          },
          { 
            label: "Всего записей", 
            value: stats.total, 
            color: "blue" as const
          }
        ]}
      />

      {/* Content Section */}
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Attendance Card */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{stats.attended}</div>
                <div className="text-green-100">Присутствовали</div>
                <div className="text-sm text-green-200 mt-1">
                  {stats.total > 0 ? Math.round((stats.attended / stats.total) * 100) : 0}% от общего числа
                </div>
              </div>
              <div className="text-4xl opacity-80">✓</div>
            </div>
          </div>

          {/* Absent Card */}
          <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{stats.absent}</div>
                <div className="text-red-100">Отсутствовали</div>
                <div className="text-sm text-red-200 mt-1">
                  {stats.total > 0 ? Math.round((stats.absent / stats.total) * 100) : 0}% от общего числа
                </div>
              </div>
              <div className="text-4xl opacity-80">✗</div>
            </div>
          </div>

          {/* Late Card */}
          <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{stats.late}</div>
                <div className="text-yellow-100">Опоздали</div>
                <div className="text-sm text-yellow-200 mt-1">
                  {stats.total > 0 ? Math.round((stats.late / stats.total) * 100) : 0}% от общего числа
                </div>
              </div>
              <div className="text-4xl opacity-80">⏰</div>
            </div>
          </div>

          {/* Special Reason Card */}
          <div className="bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{stats.specialReason}</div>
                <div className="text-purple-100">Уваж. причина</div>
                <div className="text-sm text-purple-200 mt-1">
                  {stats.total > 0 ? Math.round((stats.specialReason / stats.total) * 100) : 0}% от общего числа
                </div>
              </div>
              <div className="text-4xl opacity-80">📋</div>
            </div>
          </div>
        </div>

        {/* Filters and Table */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg rounded-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          {/* Filters */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700">
            <div className="flex items-end justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Фильтры</h3>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors text-sm"
              >
                Сбросить фильтры
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Student Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Поиск студента
                </label>
                <input
                  type="text"
                  value={filters.studentSearch || ''}
                  onChange={(e) => updateFilters({ studentSearch: e.target.value })}
                  placeholder="Имя студента..."
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 dark:text-white"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Статус
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => updateFilters({ status: e.target.value ? Number(e.target.value) as AttendanceStatus : undefined })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 dark:text-white"
                >
                  <option value="">Все статусы</option>
                  <option value="1">Присутствовал</option>
                  <option value="2">Отсутствовал</option>
                  <option value="3">Опоздал</option>
                  <option value="4">Уважительная причина</option>
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  С даты
                </label>
                <input
                  type="date"
                  value={filters.fromDate || ''}
                  onChange={(e) => updateFilters({ fromDate: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 dark:text-white"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  До даты
                </label>
                <input
                  type="date"
                  value={filters.toDate || ''}
                  onChange={(e) => updateFilters({ toDate: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center h-64 p-8">
                <div className="text-center">
                  <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full w-16 h-16 mx-auto mb-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 dark:border-emerald-400 mx-auto mt-2"></div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">Загрузка данных...</p>
                </div>
              </div>
            ) : attendanceRecords.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Данные не найдены
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Нет записей посещаемости по выбранным критериям
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Студент
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Предмет
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Группа
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Дата
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Время
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Преподаватель
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {attendanceRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {record.studentName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {record.studentLogin}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {record.subjectName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {record.groupName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(record.date).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {record.startTime.slice(0, 5)} - {record.endTime.slice(0, 5)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium"
                          style={{
                            backgroundColor: getAttendanceStatusColor(record.status) + '20',
                            color: getAttendanceStatusColor(record.status)
                          }}
                        >
                          <span>{getAttendanceStatusIcon(record.status)}</span>
                          <span>{getAttendanceStatusText(record.status)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {record.teacherName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalCount > filters.pageSize! && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Показано {Math.min(filters.pageSize!, totalCount)} из {totalCount} записей
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, pageNumber: Math.max(1, prev.pageNumber! - 1) }))}
                    disabled={filters.pageNumber === 1}
                    className="px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Назад
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                    Страница {filters.pageNumber}
                  </span>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, pageNumber: prev.pageNumber! + 1 }))}
                    disabled={filters.pageNumber! * filters.pageSize! >= totalCount}
                    className="px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Вперед
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}