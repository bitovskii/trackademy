'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthenticatedApiService } from '../../services/AuthenticatedApiService';
import { CalendarDaysIcon, PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { PageHeaderWithStats } from '../../components/ui/PageHeaderWithStats';
import { useColumnVisibility, ColumnVisibilityControl } from '../../components/ui/ColumnVisibilityControl';
import { 
  Schedule, 
  ScheduleFormData, 
  SchedulesResponse, 
  ScheduleFilters,
  formatTimeRange,
  generateSubjectColor
} from '../../types/Schedule';
import { canManageUsers } from '../../types/Role';
import { Group } from '../../types/Group';
import { Subject } from '../../types/Subject';
import { User } from '../../types/User';
import { Room } from '../../types/Room';
import { DeleteConfirmationModal } from '../../components/ui/DeleteConfirmationModal';
import { DaysOfWeekDisplay } from '../../components/ui/DaysOfWeekDisplay';
import { ScheduleCalendar } from '../../components/ui/ScheduleCalendar';
import { ViewToggle, ViewMode } from '../../components/ui/ViewToggle';
import UniversalModal from '../../components/ui/UniversalModal';
import { useUniversalModal } from '../../hooks/useUniversalModal';
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
  const [deletingSchedule, setDeletingSchedule] = useState<Schedule | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ViewMode>('table');

  // Универсальная система модалов для расписаний
  const scheduleModal = useUniversalModal('schedule', {
    daysOfWeek: '', // Handle as string for form input
    startTime: '',
    endTime: '',
    effectiveFrom: '',
    effectiveTo: '',
    groupId: '',
    teacherId: '',
    roomId: '',
    organizationId: ''
  });

  const pageSize = 10;

  // Управление видимостью колонок
  const { columns, toggleColumn, isColumnVisible } = useColumnVisibility([
    { key: 'number', label: '№', required: false },
    { key: 'group', label: 'Группа', required: true },
    { key: 'subject', label: 'Предмет' },
    { key: 'teacher', label: 'Преподаватель' },
    { key: 'room', label: 'Кабинет' },
    { key: 'days', label: 'Дни недели' },
    { key: 'time', label: 'Время' },
    { key: 'period', label: 'Окончание' },
    { key: 'actions', label: 'Действия' }
  ]);

  const loadSchedules = useCallback(async (page: number = currentPage, isTableOnly: boolean = true) => {
    try {
      if (isTableOnly) {
        setTableLoading(true);
      }

      const requestBody: ScheduleFilters = {
        ...filters,
        pageNumber: page,
        pageSize: isTableOnly ? pageSize : 1000, // Load all for calendar views
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

      setGroups((groupsData as { items: Group[] }).items || []);
      setSubjects((subjectsData as { items: Subject[] }).items || []);
      setTeachers(teachersData.items || []);
      setRooms((roomsData as { items: Room[] }).items || []);
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

  // Reload data when view changes
  useEffect(() => {
    if (isAuthenticated && user?.organizationId) {
      // For table view, use pagination
      if (currentView === 'table') {
        loadSchedules(currentPage, true);
      } else {
        // For calendar views, load all data
        loadSchedules(1, false);
      }
    }
  }, [currentView, isAuthenticated, user?.organizationId]);

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
    handleCreateUniversal();
  };

  // Validation function for schedule forms
  const validateScheduleForm = (data: Record<string, unknown>): Record<string, string> => {
    const errors: Record<string, string> = {};
    const scheduleData = data as unknown as ScheduleFormData;
    
    if (!scheduleData.daysOfWeek || scheduleData.daysOfWeek.length === 0) {
      errors.daysOfWeek = 'Дни недели обязательны';
    }
    
    if (!scheduleData.startTime) {
      errors.startTime = 'Время начала обязательно';
    }
    
    if (!scheduleData.endTime) {
      errors.endTime = 'Время окончания обязательно';
    }
    
    if (scheduleData.startTime && scheduleData.endTime && scheduleData.startTime >= scheduleData.endTime) {
      errors.endTime = 'Время окончания должно быть больше времени начала';
    }
    
    if (!scheduleData.effectiveFrom) {
      errors.effectiveFrom = 'Дата начала действия обязательна';
    }
    
    if (!scheduleData.groupId) {
      errors.groupId = 'Группа обязательна';
    }
    
    if (!scheduleData.teacherId) {
      errors.teacherId = 'Преподаватель обязателен';
    }
    
    if (!scheduleData.roomId) {
      errors.roomId = 'Аудитория обязательна';
    }
    
    return errors;
  };

  // Обработчики для универсальной системы модалов
  const handleCreateUniversal = () => {
    scheduleModal.openCreateModal();
  };

  const handleEditUniversal = (id: string) => {
    const schedule = schedules.find(s => s.id === id);
    if (schedule) {
      scheduleModal.openEditModal({
        daysOfWeek: schedule.daysOfWeek.join(','), // Convert array to string for form
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        effectiveFrom: schedule.effectiveFrom,
        effectiveTo: schedule.effectiveTo || '',
        groupId: schedule.group.id,
        teacherId: schedule.teacher.id,
        roomId: schedule.room.id,
        organizationId: user?.organizationId || ''
      });
    }
  };

  // Handlers for Universal Modal save operations
  const handleSaveCreate = async (formData: Record<string, unknown>) => {
    try {
      const scheduleData: ScheduleFormData = {
        daysOfWeek: formData.daysOfWeek ? (formData.daysOfWeek as string).split(',').map((day: string) => parseInt(day.trim())) : [],
        startTime: formData.startTime as string,
        endTime: formData.endTime as string,
        effectiveFrom: formData.effectiveFrom as string,
        effectiveTo: (formData.effectiveTo as string) || undefined,
        groupId: formData.groupId as string,
        teacherId: formData.teacherId as string,
        roomId: formData.roomId as string,
        organizationId: user?.organizationId || ''
      };
      
      await AuthenticatedApiService.post('/Schedule/create-schedule', scheduleData);
      await loadSchedules(currentPage, true);
      scheduleModal.closeModal();
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  };

  const handleSaveEdit = async (formData: Record<string, unknown>) => {
    try {
      const updateData = {
        daysOfWeek: formData.daysOfWeek ? (formData.daysOfWeek as string).split(',').map((day: string) => parseInt(day.trim())) : [],
        startTime: formData.startTime as string,
        endTime: formData.endTime as string,
        effectiveFrom: formData.effectiveFrom as string,
        effectiveTo: (formData.effectiveTo as string) || null,
        groupId: formData.groupId as string,
        teacherId: formData.teacherId as string,
        roomId: formData.roomId as string
      };
      
      if (scheduleModal.editData) {
        // Find the schedule to get its ID
        const scheduleToEdit = schedules.find(s => 
          s.group.id === scheduleModal.editData?.groupId &&
          s.teacher.id === scheduleModal.editData?.teacherId &&
          s.room.id === scheduleModal.editData?.roomId
        );
        
        if (scheduleToEdit) {
          await AuthenticatedApiService.put(`/Schedule/update-schedule/${scheduleToEdit.id}`, updateData);
          await loadSchedules(currentPage, true);
          scheduleModal.closeModal();
        }
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw error;
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
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-6 py-4 flex items-center justify-between border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Предыдущая
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Следующая
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Показано <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> по{' '}
              <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> из{' '}
              <span className="font-medium">{totalCount}</span> результатов
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Предыдущая
              </button>
              {pageNumbers.map((number) => (
                <button
                  key={number}
                  onClick={() => handlePageChange(number)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-200 ${
                    number === currentPage
                      ? 'z-10 bg-violet-50 dark:bg-violet-900/50 border-violet-500 dark:border-violet-400 text-violet-600 dark:text-violet-300'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {number}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Modern Header Card */}
        <PageHeaderWithStats
          title="Шаблоны расписаний"
          subtitle="Управление расписанием занятий организации"
          icon={CalendarDaysIcon}
          gradientFrom="violet-500"
          gradientTo="purple-600"
          actionLabel="Создать шаблон"
          onAction={handleCreate}
          extraActions={
            <ColumnVisibilityControl
              columns={columns}
              onColumnToggle={toggleColumn}
              variant="header"
            />
          }
          stats={[
            { label: "Всего шаблонов", value: totalCount, color: "violet" },
            { label: "На странице", value: schedules.length, color: "purple" },
            { label: "Страниц", value: totalPages, color: "indigo" }
          ]}
        />

        {/* Content Card */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg rounded-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">

          {/* Filters Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-violet-50 dark:from-gray-800 dark:to-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Group Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Группа</label>
                <select
                  value={filters.groupId || ''}
                  onChange={(e) => handleFilterChange({ groupId: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm text-gray-900 dark:text-white transition-all duration-200"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Предмет</label>
                <select
                  value={filters.subjectId || ''}
                  onChange={(e) => handleFilterChange({ subjectId: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm text-gray-900 dark:text-white transition-all duration-200"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Преподаватель</label>
                <select
                  value={filters.teacherId || ''}
                  onChange={(e) => handleFilterChange({ teacherId: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm text-gray-900 dark:text-white transition-all duration-200"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Кабинет</label>
                <select
                  value={filters.roomId || ''}
                  onChange={(e) => handleFilterChange({ roomId: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm text-gray-900 dark:text-white transition-all duration-200"
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
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600 mx-auto"></div>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Загрузка шаблонов расписаний...</p>
            </div>
          )}

          {/* Mobile Card View */}
          {!tableLoading && (
            <div className="block md:hidden">
              {schedules.length === 0 ? (
                <div className="text-center py-16 p-6">
                  <div className="p-4 bg-violet-100 dark:bg-violet-900/30 rounded-full w-16 h-16 mx-auto mb-6">
                    <CalendarDaysIcon className="h-8 w-8 text-violet-600 dark:text-violet-400 mx-auto mt-2" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Нет шаблонов расписаний</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Создайте первый шаблон расписания для начала работы
                  </p>
                  <button
                    onClick={handleCreate}
                    className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 hover:scale-105 inline-flex items-center"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Создать шаблон
                  </button>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {schedules.map((schedule, index) => (
                    <div
                      key={schedule.id}
                      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-medium rounded-lg shadow-sm">
                            {(filters.pageNumber - 1) * pageSize + index + 1}
                          </div>
                          <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                            <CalendarDaysIcon className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {schedule.group.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {schedule.subject.subjectName}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditUniversal(schedule.id)}
                            className="text-violet-600 hover:text-violet-900 dark:text-violet-400 dark:hover:text-violet-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                            title="Редактировать"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(schedule.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                            title="Удалить"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <span className="font-medium mr-2">Преподаватель:</span>
                          {schedule.teacher.name}
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <span className="font-medium mr-2">Кабинет:</span>
                          {schedule.room.name}
                        </div>
                        <div className="flex items-start text-gray-600 dark:text-gray-400">
                          <span className="font-medium mr-2 mt-1">Дни:</span>
                          <DaysOfWeekDisplay daysOfWeek={schedule.daysOfWeek} size="sm" />
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <span className="font-medium mr-2">Время:</span>
                          {formatTimeRange(schedule.startTime, schedule.endTime)}
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <span className="font-medium mr-2">Окончание:</span>
                          {schedule.effectiveTo ? new Date(schedule.effectiveTo).toLocaleDateString('ru-RU') : 'Бессрочно'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Desktop Table View */}
          {!tableLoading && (
            <div className="hidden md:block">
              {/* View Toggle */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <ViewToggle 
                  currentView={currentView}
                  onViewChange={setCurrentView}
                />
              </div>

              {schedules.length === 0 ? (
                <div className="text-center py-16 p-6">
                  <div className="p-4 bg-violet-100 dark:bg-violet-900/30 rounded-full w-16 h-16 mx-auto mb-6">
                    <CalendarDaysIcon className="h-8 w-8 text-violet-600 dark:text-violet-400 mx-auto mt-2" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Нет шаблонов расписаний</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Создайте первый шаблон расписания для начала работы
                  </p>
                  <button
                    onClick={handleCreate}
                    className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 hover:scale-105 inline-flex items-center"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Создать шаблон
                  </button>
                </div>
              ) : (
                <>
                  {/* Table View */}
                  {currentView === 'table' && (
                    <div>
                      <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gradient-to-r from-gray-50 to-violet-50 dark:from-gray-700 dark:to-gray-600">
                      <tr>
                        {isColumnVisible('number') && (
                          <th className="px-3 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider w-16">
                            №
                          </th>
                        )}
                        {isColumnVisible('group') && (
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                            Группа
                          </th>
                        )}
                        {isColumnVisible('subject') && (
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                            Предмет
                          </th>
                        )}
                        {isColumnVisible('teacher') && (
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                            Преподаватель
                          </th>
                        )}
                        {isColumnVisible('room') && (
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                            Кабинет
                          </th>
                        )}
                        {isColumnVisible('days') && (
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                            Дни недели
                          </th>
                        )}
                        {isColumnVisible('time') && (
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                            Время
                          </th>
                        )}
                        {isColumnVisible('period') && (
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                            Окончание
                          </th>
                        )}
                        {isColumnVisible('actions') && (
                          <th className="px-8 py-4 w-32 text-center text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                            Действия
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {schedules.map((schedule, index) => (
                        <tr key={schedule.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-700/30'}`}>
                          {isColumnVisible('number') && (
                            <td className="px-3 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-medium rounded-lg shadow-sm mx-auto">
                                {(filters.pageNumber - 1) * pageSize + index + 1}
                              </div>
                            </td>
                          )}
                          {isColumnVisible('group') && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {schedule.group.name}
                            </td>
                          )}
                          {isColumnVisible('subject') && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              <div className="flex items-center">
                                <div 
                                  className="w-3 h-3 rounded-full mr-2"
                                  style={{ backgroundColor: generateSubjectColor(schedule.subject.subjectName) }}
                                ></div>
                                {schedule.subject.subjectName}
                              </div>
                            </td>
                          )}
                          {isColumnVisible('teacher') && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {schedule.teacher.name}
                            </td>
                          )}
                          {isColumnVisible('room') && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {schedule.room.name}
                            </td>
                          )}
                          {isColumnVisible('days') && (
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                              <DaysOfWeekDisplay daysOfWeek={schedule.daysOfWeek} size="sm" />
                            </td>
                          )}
                          {isColumnVisible('time') && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {formatTimeRange(schedule.startTime, schedule.endTime)}
                            </td>
                          )}
                          {isColumnVisible('period') && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {schedule.effectiveTo ? new Date(schedule.effectiveTo).toLocaleDateString('ru-RU') : 'Бессрочно'}
                            </td>
                          )}
                          {isColumnVisible('actions') && (
                            <td className="px-8 py-4 whitespace-nowrap text-right text-sm font-medium w-32">
                              <div className="flex items-center justify-end space-x-1 pr-2">
                                <button
                                  onClick={() => handleEditUniversal(schedule.id)}
                                  className="p-1.5 text-violet-600 hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-300 bg-violet-50 hover:bg-violet-100 dark:bg-violet-900/30 dark:hover:bg-violet-900/50 rounded-md transition-all duration-200"
                                  title="Редактировать"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(schedule.id)}
                                  className="p-1.5 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded-md transition-all duration-200"
                                  title="Удалить"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                    </div>
                  )}

                  {/* Calendar Views */}
                  {currentView !== 'table' && (
                    <div className="p-6">
                      <ScheduleCalendar
                        schedules={schedules}
                        viewType={currentView}
                        onEventClick={(schedule: Schedule) => handleEditUniversal(schedule.id)}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}

        {/* Pagination - only for table view */}
        {currentView === 'table' && renderPagination()}
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

        {/* Universal Schedule Modal */}
        <UniversalModal
          isOpen={scheduleModal.isOpen}
          onClose={scheduleModal.closeModal}
          mode={scheduleModal.mode}
          title={scheduleModal.getConfig().title}
          subtitle={scheduleModal.getConfig().subtitle}
          icon={scheduleModal.getConfig().icon}
          gradientFrom={scheduleModal.getConfig().gradientFrom}
          gradientTo={scheduleModal.getConfig().gradientTo}
          initialData={scheduleModal.initialData}
          data={scheduleModal.editData || undefined}
          onSave={scheduleModal.mode === 'create' ? handleSaveCreate : handleSaveEdit}
          validate={validateScheduleForm}
          submitText={scheduleModal.getConfig().submitText}
          loadingText={scheduleModal.getConfig().loadingText}
        >
          {({ formData, setFormData, errors, setErrors }) => (
            <div className="space-y-4">
              {/* Days of Week */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Дни недели
                </label>
                <input
                  type="text"
                  value={formData.daysOfWeek || ''}
                  onChange={(e) => setFormData({ ...formData, daysOfWeek: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Пн, Вт, Ср..."
                  required
                />
                {errors.daysOfWeek && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.daysOfWeek}</p>
                )}
              </div>

              {/* Start Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Время начала
                </label>
                <input
                  type="time"
                  value={formData.startTime || ''}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
                {errors.startTime && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.startTime}</p>
                )}
              </div>

              {/* End Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Время окончания
                </label>
                <input
                  type="time"
                  value={formData.endTime || ''}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
                {errors.endTime && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.endTime}</p>
                )}
              </div>

              {/* Effective From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Действует с
                </label>
                <input
                  type="date"
                  value={formData.effectiveFrom || ''}
                  onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
                {errors.effectiveFrom && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.effectiveFrom}</p>
                )}
              </div>

              {/* Effective To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Действует до
                </label>
                <input
                  type="date"
                  value={formData.effectiveTo || ''}
                  onChange={(e) => setFormData({ ...formData, effectiveTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                {errors.effectiveTo && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.effectiveTo}</p>
                )}
              </div>

              {/* Group Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Группа
                </label>
                <select
                  value={formData.groupId || ''}
                  onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Выберите группу</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
                {errors.groupId && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.groupId}</p>
                )}
              </div>

              {/* Teacher Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Преподаватель
                </label>
                <select
                  value={formData.teacherId || ''}
                  onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Выберите преподавателя</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.login}
                    </option>
                  ))}
                </select>
                {errors.teacherId && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.teacherId}</p>
                )}
              </div>

              {/* Room Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Аудитория
                </label>
                <select
                  value={formData.roomId || ''}
                  onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Выберите аудиторию</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
                {errors.roomId && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.roomId}</p>
                )}
              </div>
            </div>
          )}
        </UniversalModal>
      </div>
    </div>
  );
}