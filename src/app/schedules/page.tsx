'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthenticatedApiService } from '../../services/AuthenticatedApiService';
import { CalendarDaysIcon, PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { 
  Schedule, 
  ScheduleFormData, 
  SchedulesResponse, 
  ScheduleFilters,
  formatDaysOfWeek,
  formatTimeRange,
  formatEffectivePeriod,
  generateSubjectColor
} from '../../types/Schedule';
import { canManageUsers } from '../../types/Role';
import { Group } from '../../types/Group';
import { Subject } from '../../types/Subject';
import { User } from '../../types/User';
import { Room } from '../../types/Room';
import { DeleteConfirmationModal } from '../../components/ui/DeleteConfirmationModal';
import CreateScheduleModal from '../../components/CreateScheduleModal';
import EditScheduleModal from '../../components/EditScheduleModal';
import Link from 'next/link';

export default function SchedulesPage() {
  const { isAuthenticated, user } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [tableLoading, setTableLoading] = useState(false);
  
  // Filter states
  const [groups, setGroups] = useState<Group[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filters, setFilters] = useState<ScheduleFilters>({
    pageNumber: 1,
    pageSize: 10,
    organizationId: user?.organizationId || '',
    groupId: '',
    teacherId: '',
    roomId: '',
    subjectId: ''
  });

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingSchedule, setDeletingSchedule] = useState<Schedule | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const pageSize = 10;

  const loadSchedules = useCallback(async (page: number = currentPage, isTableOnly: boolean = true) => {
    try {
      if (isTableOnly) {
        setTableLoading(true);
      }

      const requestBody: ScheduleFilters = {
        ...filters,
        pageNumber: page,
        pageSize: pageSize,
        organizationId: user?.organizationId || ''
      };

      // Remove empty filter values
      Object.keys(requestBody).forEach(key => {
        if (requestBody[key as keyof ScheduleFilters] === '') {
          delete requestBody[key as keyof ScheduleFilters];
        }
      });

      const data = await AuthenticatedApiService.post<SchedulesResponse>('/Schedule/get-all-schedules', requestBody);
      
      setSchedules(data.items);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to load schedules:', error);
      setError('Не удалось загрузить список шаблонов расписаний');
    } finally {
      if (isTableOnly) {
        setTableLoading(false);
      }
    }
  }, [currentPage, user?.organizationId, filters]);

  const loadFilterData = useCallback(async () => {
    try {
      const [groupsData, subjectsData, teachersData, roomsData] = await Promise.all([
        // Load groups
        AuthenticatedApiService.post('/Group/get-groups', {
          pageNumber: 1,
          pageSize: 1000,
          organizationId: user?.organizationId
        }),
        // Load subjects
        AuthenticatedApiService.post('/Subject/GetAllSubjects', {
          pageNumber: 1,
          pageSize: 1000,
          organizationId: user?.organizationId
        }),
        // Load teachers (role 3)
        AuthenticatedApiService.getUsers({
          organizationId: user?.organizationId || '',
          pageNumber: 1,
          pageSize: 1000,
          roleIds: [3] // Teachers only
        }),
        // Load rooms
        AuthenticatedApiService.post('/Room/GetAllRooms', {
          pageNumber: 1,
          pageSize: 1000,
          organizationId: user?.organizationId
        })
      ]);

      setGroups((groupsData as any).items || []);
      setSubjects((subjectsData as any).items || []);
      setTeachers(teachersData.items || []);
      setRooms((roomsData as any).items || []);
    } catch (error) {
      console.error('Failed to load filter data:', error);
    }
  }, [user?.organizationId]);

  useEffect(() => {
    if (isAuthenticated && user?.organizationId) {
      setFilters(prev => ({ ...prev, organizationId: user.organizationId || '' }));
      loadFilterData();
      loadSchedules(currentPage, true);
    }
  }, [isAuthenticated, user?.organizationId]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadSchedules(page, true);
  };

  const handleFilterChange = (newFilters: Partial<ScheduleFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    setCurrentPage(1);
    
    // Immediately load with new filters instead of waiting for state update
    loadSchedulesWithFilters(1, updatedFilters);
  };

  const loadSchedulesWithFilters = async (page: number, currentFilters: ScheduleFilters) => {
    try {
      setTableLoading(true);

      const requestBody: ScheduleFilters = {
        ...currentFilters,
        pageNumber: page,
        pageSize: pageSize,
        organizationId: user?.organizationId || ''
      };

      // Remove empty filter values
      Object.keys(requestBody).forEach(key => {
        if (requestBody[key as keyof ScheduleFilters] === '') {
          delete requestBody[key as keyof ScheduleFilters];
        }
      });

      const data = await AuthenticatedApiService.post<SchedulesResponse>('/Schedule/get-all-schedules', requestBody);
      
      setSchedules(data.items);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to load schedules:', error);
      setError('Не удалось загрузить список шаблонов расписаний');
    } finally {
      setTableLoading(false);
    }
  };

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleEdit = (id: string) => {
    const schedule = schedules.find(s => s.id === id);
    if (schedule) {
      setEditingSchedule(schedule);
      setIsEditModalOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    const schedule = schedules.find(s => s.id === id);
    if (schedule) {
      setDeletingSchedule(schedule);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingSchedule) return;
    
    try {
      await AuthenticatedApiService.delete(`/Schedule/${deletingSchedule.id}`);
      await loadSchedules(currentPage, true);
      handleCloseDeleteModal();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw error;
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingSchedule(null);
  };

  const handleCreateSchedule = async (formData: ScheduleFormData) => {
    try {
      await AuthenticatedApiService.post('/Schedule/create-schedule', formData);
      await loadSchedules(currentPage, true);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  };

  const handleEditSchedule = async (id: string, formData: ScheduleFormData) => {
    try {
      // For update, we need to use a different API format
      // The API expects startTime and endTime as timespan objects with ticks
      // But we can send the simple time string format and let the API handle conversion
      const updateData = {
        daysOfWeek: formData.daysOfWeek,
        startTime: formData.startTime, // Send as "09:00:00"
        endTime: formData.endTime,     // Send as "10:30:00"
        effectiveFrom: formData.effectiveFrom,
        effectiveTo: formData.effectiveTo || null,
        groupId: formData.groupId,
        teacherId: formData.teacherId,
        roomId: formData.roomId
      };
      
      await AuthenticatedApiService.put(`/Schedule/update-schedule/${id}`, updateData);
      await loadSchedules(currentPage, true);
      setIsEditModalOpen(false);
      setEditingSchedule(null);
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw error;
    }
  };

  // Check authentication and permissions
  if (!isAuthenticated) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Требуется авторизация</h3>
          <p className="mt-1 text-sm text-gray-500">
            Войдите в систему для управления шаблонами расписаний
          </p>
          <div className="mt-6">
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Войти в систему
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Check if user has admin permissions (roles 2 or 4)
  if (user && !canManageUsers(user.role)) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <CalendarDaysIcon className="w-full h-full" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Недостаточно прав</h3>
          <p className="mt-1 text-sm text-gray-500">
            Доступ к шаблонам расписаний имеют только администраторы
          </p>
        </div>
      </div>
    );
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Предыдущая
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Следующая
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Показано <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> по{' '}
              <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> из{' '}
              <span className="font-medium">{totalCount}</span> результатов
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Предыдущая
              </button>
              {pageNumbers.map((number) => (
                <button
                  key={number}
                  onClick={() => handlePageChange(number)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    number === currentPage
                      ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {number}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Следующая
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            <p className="font-medium">Ошибка загрузки</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={() => loadSchedules(currentPage, true)}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">Шаблоны расписаний</h1>
          <button
            onClick={handleCreate}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Создать шаблон
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Group Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Группа</label>
              <select
                value={filters.groupId || ''}
                onChange={(e) => handleFilterChange({ groupId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              >
                <option value="">Все группы</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Предмет</label>
              <select
                value={filters.subjectId || ''}
                onChange={(e) => handleFilterChange({ subjectId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              >
                <option value="">Все предметы</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Teacher Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Преподаватель</label>
              <select
                value={filters.teacherId || ''}
                onChange={(e) => handleFilterChange({ teacherId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              >
                <option value="">Все преподаватели</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Room Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Кабинет</label>
              <select
                value={filters.roomId || ''}
                onChange={(e) => handleFilterChange({ roomId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              >
                <option value="">Все кабинеты</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {tableLoading && (
          <div className="px-6 py-8 text-center">
            <div className="inline-flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mr-3"></div>
              Загрузка шаблонов расписаний...
            </div>
          </div>
        )}

        {/* Table */}
        {!tableLoading && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Группа
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Предмет
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Преподаватель
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Кабинет
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дни недели
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Время
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Период действия
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {schedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {schedule.group.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: generateSubjectColor(schedule.subject.subjectName) }}
                        ></div>
                        {schedule.subject.subjectName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {schedule.teacher.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {schedule.room.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDaysOfWeek(schedule.daysOfWeek)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTimeRange(schedule.startTime, schedule.endTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatEffectivePeriod(schedule.effectiveFrom, schedule.effectiveTo)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(schedule.id)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded transition-colors"
                          title="Редактировать"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(schedule.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                          title="Удалить"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {schedules.length === 0 && !tableLoading && (
              <div className="text-center py-12">
                <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Нет шаблонов расписаний</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Начните с создания первого шаблона расписания.
                </p>
                <div className="mt-6">
                  <button
                    onClick={handleCreate}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Создать шаблон
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {renderPagination()}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Удалить шаблон расписания"
        message={`Вы уверены, что хотите удалить шаблон расписания для группы "${deletingSchedule?.group?.name}"?`}
        itemName={deletingSchedule?.group?.name}
      />

      {/* TODO: Add Create and Edit Modals */}

      {/* Create Schedule Modal */}
      <CreateScheduleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateSchedule}
        organizationId={user?.organizationId || ''}
      />

      {/* Edit Schedule Modal */}
      <EditScheduleModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingSchedule(null);
        }}
        onSave={handleEditSchedule}
        schedule={editingSchedule}
        organizationId={user?.organizationId || ''}
      />
    </div>
  );
}