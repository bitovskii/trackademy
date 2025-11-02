'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthenticatedApiService } from '../../services/AuthenticatedApiService';
import { AcademicCapIcon } from '@heroicons/react/24/outline';
import { User, UserFormData } from '../../types/User';
import UniversalModal from '../../components/ui/UniversalModal';
import { useUniversalModal } from '../../hooks/useUniversalModal';
import { DeleteConfirmationModal } from '../../components/ui/DeleteConfirmationModal';
import { UserFilters, UserFilters as UserFiltersType } from '../../components/ui/UserFiltersUpdated';
import { UsersTable } from '../../components/ui/UsersTable';
import { useDebounce } from '../../hooks/useDebounce';
import { canManageUsers } from '../../types/Role';
import Link from 'next/link';
import { PageHeaderWithStats } from '../../components/ui/PageHeaderWithStats';
import { useColumnVisibility, ColumnVisibilityControl } from '../../components/ui/ColumnVisibilityControl';
import { UserForm } from '../../components/forms/UserForm';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { EmailInput } from '@/components/ui/EmailInput';
import { PasswordInput } from '@/components/ui/PasswordInput';

export default function StudentsPage() {
  const { isAuthenticated, user } = useAuth();
  const [students, setStudents] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Универсальная система модалов для пользователей
  const userModal = useUniversalModal('user', {
    login: '',
    fullName: '',
    email: '',
    password: '',
    phone: '',
    parentPhone: '',
    birthday: '',
    role: 1,
    organizationId: ''
  });

  const [filters, setFilters] = useState<UserFiltersType>({
    search: '',
    roleIds: [],
    groupIds: []
  });
  const [groups, setGroups] = useState<Array<{id: string, name: string}>>([]);
  const [tableLoading, setTableLoading] = useState(false);
  
  // Column visibility management
  const { columns, toggleColumn, isColumnVisible } = useColumnVisibility([
    { key: 'number', label: '#', required: true },
    { key: 'user', label: 'Пользователь', required: true },
    { key: 'contacts', label: 'Контакты' },
    { key: 'role', label: 'Роль' },
    { key: 'group', label: 'Группа' },
    { key: 'actions', label: 'Действия', required: true }
  ]);
  
  // Debounce search to avoid too many API calls
  const debouncedSearchTerm = useDebounce(filters.search, 300);
  
  // Track previous search term to avoid unnecessary calls
  const [prevDebouncedSearch, setPrevDebouncedSearch] = useState('');
  
  const pageSize = 10;

  const loadStudents = useCallback(async (page: number = currentPage, userFilters: UserFiltersType = filters, isTableOnly: boolean = true) => {
    // Ранняя проверка аутентификации
    if (!isAuthenticated) {
      console.warn('User not authenticated, skipping loadStudents');
      return;
    }
    
    try {
      if (isTableOnly) {
        setTableLoading(true);
      } else {
        // Не нужно устанавливать loading, используем только tableLoading
      }
      setError(null);
      
      // Более надежное получение organizationId с правильной логикой
      let organizationId = user?.organizationId;
      
      // Если organizationId не найден в контексте, попробуем получить из localStorage
      if (!organizationId) {
        try {
          const userData = localStorage.getItem('user');
          if (userData) {
            const userObj = JSON.parse(userData);
            organizationId = userObj.organizationId;
            console.log('OrganizationId extracted from localStorage user:', organizationId);
          }
        } catch (e) {
          console.warn('Could not parse user data from localStorage:', e);
        }
      }
      
      const authToken = localStorage.getItem('authToken');
      
      if (!organizationId) {
        // Получаем данные пользователя из localStorage для логирования ошибки
        let localStorageUserData = null;
        try {
          const userData = localStorage.getItem('user');
          if (userData) {
            localStorageUserData = JSON.parse(userData);
          }
        } catch (e) {
          console.warn('Could not parse user data for error logging');
        }

        console.error('Organization ID not found. User context:', user, 'LocalStorage user data:', localStorageUserData);
        setError('Не удается определить организацию пользователя');
        return;
      }

      if (!authToken) {
        setError('Требуется авторизация');
        return;
      }

      // Используем debouncedSearchTerm для поиска
      const searchTerm = userFilters === filters ? debouncedSearchTerm : userFilters.search;

      const data = await AuthenticatedApiService.getUsers({
        organizationId,
        pageNumber: page,
        pageSize,
        search: searchTerm || undefined,
        roleIds: userFilters.roleIds.length > 0 ? userFilters.roleIds : undefined,
        groupIds: userFilters.groupIds.length > 0 ? userFilters.groupIds : undefined
      });
      
      setStudents(data.items);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
      setCurrentPage(page);
      
    } catch (error) {
      console.error('Failed to load students:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Не удалось загрузить список пользователей');
      }
    } finally {
      if (isTableOnly) {
        setTableLoading(false);
      } else {
        // Не нужно управлять loading, используем только tableLoading
      }
    }
  }, [user?.organizationId, debouncedSearchTerm, isAuthenticated, filters]);

  const loadGroups = useCallback(async () => {
    try {
      let organizationId = user?.organizationId;
      
      // Если organizationId не найден в контексте, попробуем получить из localStorage
      if (!organizationId) {
        try {
          const userData = localStorage.getItem('user');
          if (userData) {
            const userObj = JSON.parse(userData);
            organizationId = userObj.organizationId;
          }
        } catch (e) {
          console.warn('Could not parse user data from localStorage in loadGroups:', e);
        }
      }
      
      if (!organizationId) return;

      const groupsResponse = await AuthenticatedApiService.getGroups(organizationId, 1000);
      setGroups(groupsResponse?.items || []);
    } catch (error) {
      console.error('Failed to load groups:', error);
    }
  }, [user?.organizationId]);

  const handleFilterChange = useCallback((newFilters: UserFiltersType) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  const handlePageChange = useCallback((page: number) => {
    // Получаем organizationId из localStorage для логирования
    let localStorageOrgId = null;
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const userObj = JSON.parse(userData);
        localStorageOrgId = userObj.organizationId;
      }
    } catch (e) {
      console.warn('Could not parse user data from localStorage for logging');
    }

    console.log('handlePageChange called:', { 
      page, 
      isAuthenticated, 
      userId: user?.id, 
      userOrganizationId: user?.organizationId,
      localStorageOrganizationId: localStorageOrgId
    });
    
    // Проверяем, что пользователь аутентифицирован перед сменой страницы
    if (!isAuthenticated) {
      console.warn('User not authenticated, skipping page change');
      return;
    }
    
    setCurrentPage(page);
    loadStudents(page, filters, true); // Only update table
  }, [isAuthenticated, loadStudents]);

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
      <div className="flex items-center justify-between">
        {/* Info */}
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Показано{' '}
            <span className="font-medium text-gray-900 dark:text-white">
              {(currentPage - 1) * pageSize + 1}
            </span>
            {' '}–{' '}
            <span className="font-medium text-gray-900 dark:text-white">
              {Math.min(currentPage * pageSize, totalCount)}
            </span>
            {' '}из{' '}
            <span className="font-medium text-gray-900 dark:text-white">
              {totalCount}
            </span>
            {' '}результатов
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                     text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="flex items-center gap-1">
            {pageNumbers.map((number) => (
              <button
                key={number}
                onClick={() => handlePageChange(number)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentPage === number
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {number}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                     text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  // Effect for debounced search
  useEffect(() => {
    if (isAuthenticated && debouncedSearchTerm !== prevDebouncedSearch) {
      setPrevDebouncedSearch(debouncedSearchTerm);
      loadStudents(1, filters, true); // Only update table
    }
  }, [debouncedSearchTerm, isAuthenticated]);

  // Effect for role and group filters (immediate)
  useEffect(() => {
    if (isAuthenticated && (filters.roleIds.length > 0 || filters.groupIds.length > 0)) {
      loadStudents(1, filters, true); // Only update table
    }
  }, [filters.roleIds, filters.groupIds, isAuthenticated]);

  // If all filters are cleared, make sure the table refreshes to show unfiltered data
  useEffect(() => {
    const noFilters = !filters.search && filters.roleIds.length === 0 && filters.groupIds.length === 0;
    if (isAuthenticated && noFilters) {
      // Force table-only reload when user clears all filters
      loadStudents(1, filters, true);
    }
  }, [filters.search, filters.roleIds.length, filters.groupIds.length, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && !students.length) {
      loadStudents(1, filters, true); // Only update table, no full page load needed
      loadGroups();
    }
  }, [isAuthenticated, students.length]);

  // Debug effect to track user context changes
  useEffect(() => {
    // Получаем organizationId из localStorage для логирования
    let localStorageOrgId = null;
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const userObj = JSON.parse(userData);
        localStorageOrgId = userObj.organizationId;
      }
    } catch (e) {
      console.warn('Could not parse user data from localStorage for debug logging');
    }

    console.log('User context changed:', {
      isAuthenticated,
      userId: user?.id,
      userOrganizationId: user?.organizationId,
      userRole: user?.role,
      localStorageOrganizationId: localStorageOrgId,
      localStorageAuthToken: !!localStorage.getItem('authToken')
    });
  }, [isAuthenticated, user?.id, user?.organizationId]);

  // Check authentication after all hooks are called
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 page-container">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 max-w-md">
              <div className="text-blue-500 text-4xl mb-4">
                🔒
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Требуется авторизация
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Войдите в систему для управления пользователями
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

  const handleEdit = (editUser: User) => {
    console.log('Starting edit for user:', { 
      editUserId: editUser.id, 
      editUserRole: editUser.role, 
      currentUserRole: user?.role,
      isCurrentUser: editUser.id === user?.id
    });
    
    setEditingUserId(editUser.id); // Сохраняем ID редактируемого пользователя
    userModal.openEditModal({
      login: editUser.login,
      fullName: editUser.name,
      email: editUser.email,
      password: '', // Пароль не заполняем при редактировании
      phone: editUser.phone,
      parentPhone: editUser.parentPhone || '',
      birthday: editUser.birthday || '',
      role: editUser.role,
      organizationId: editUser.organizationId || ''
    });
  };

  const handleSaveEdit = async (id: string, formData: UserFormData) => {
    try {
      console.log('Starting user update:', { id, formData, authToken: !!localStorage.getItem('authToken') });
      
      const result = await AuthenticatedApiService.updateUser(id, formData);
      
      console.log('Update result:', result);
      
      // Check if the update was successful
      if (!result.success) {
        throw new Error('Не удалось обновить пользователя. Попробуйте еще раз.');
      }
      
  await loadStudents(currentPage, filters, true); // Reload only the table
  setEditingUserId(null); // Очищаем ID после успешного обновления
    } catch (error) {
      console.error('Error updating user:', error);
      console.log('Auth state after error:', { 
        authToken: !!localStorage.getItem('authToken'),
        user: !!localStorage.getItem('user')
      });
      throw error; // Re-throw to let the modal handle the error display
    }
  };

  const handleDelete = (user: User) => {
    setDeletingUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    
    try {
      const result = await AuthenticatedApiService.deleteUser(deletingUser.id);
      
      // Check if the deletion was successful
      if (!result.success) {
        throw new Error('Не удалось удалить пользователя. Попробуйте еще раз.');
      }
      
      await loadStudents(currentPage, filters, true); // Reload only the table
      handleCloseDeleteModal();
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error; // Re-throw to let the modal handle the error display
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingUser(null);
  };

  const handleCloseModal = () => {
    setEditingUserId(null); // Очищаем ID редактируемого пользователя
    userModal.closeModal();
  };

  // Create user handlers
  const handleCreateUser = async (userData: UserFormData) => {
    try {
      const response = await fetch('https://trackademy.onrender.com/api/User/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Не удалось создать пользователя');
      }

      // Reload only the table to show the new user
      await loadStudents(currentPage, filters, true);
      userModal.closeModal();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error; // Re-throw to let the modal handle the error display
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 max-w-md">
              <div className="text-red-500 text-4xl mb-4">
                ⚠️
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Ошибка загрузки
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error}
              </p>
              <button
                onClick={() => loadStudents(currentPage, filters, true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 
                         text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all 
                         duration-200 transform hover:-translate-y-0.5"
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 page-container">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Modern Header with Gradient */}
        <PageHeaderWithStats
          title="Студенты"
          subtitle="Управление пользователями системы"
          icon={AcademicCapIcon}
          gradientFrom="emerald-500"
          gradientTo="lime-600"
          actionLabel={user && canManageUsers(user.role) ? "Добавить студента" : undefined}
          onAction={user && canManageUsers(user.role) ? () => userModal.openCreateModal() : undefined}
          extraActions={
            <ColumnVisibilityControl
              columns={columns}
              onColumnToggle={toggleColumn}
              variant="header"
            />
          }
          stats={[
            { label: "Всего студентов", value: totalCount, color: "emerald" },
            { label: "На странице", value: students.length, color: "lime" },
            { label: "Страниц", value: totalPages, color: "green" }
          ]}
        />

        {/* Content Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Filters Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <UserFilters
              onFilterChange={handleFilterChange}
              groups={groups}
              isLoading={tableLoading}
            />
          </div>

          {/* Users Table */}
          <div className="overflow-hidden">
            <UsersTable
              users={students}
              isLoading={tableLoading}
              currentUser={user ? {
                id: user.id,
                login: user.login,
                name: user.fullName,
                email: user.email,
                phone: '',
                parentPhone: '',
                birthday: '',
                role: user.role === 'Administrator' ? 2 : user.role === 'Teacher' ? 3 : 1,
                organizationId: user.organizationId || '',
                groups: []
              } : undefined}
              onEdit={handleEdit}
              onDelete={handleDelete}
              showColumnControls={false}
              columnVisibility={isColumnVisible}
              currentPage={currentPage}
              itemsPerPage={pageSize}
            />
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              {renderPagination()}
            </div>
          )}
        </div>
      </div>

      {/* Universal User Modal */}
      <UniversalModal
        isOpen={userModal.isOpen}
        mode={userModal.mode}
        title={userModal.getConfig().title}
        subtitle={userModal.getConfig().subtitle}
        icon={userModal.getConfig().icon}
        gradientFrom={userModal.getConfig().gradientFrom}
        gradientTo={userModal.getConfig().gradientTo}
        maxWidth="2xl"
        initialData={{
          login: '',
          fullName: '',
          email: '',
          password: '',
          phone: '',
          parentPhone: '',
          birthday: '',
          role: 1,
          organizationId: user?.organizationId || ''
        }}
        data={userModal.editData || undefined}
        onClose={handleCloseModal}
        onSave={async (data: Record<string, unknown>) => {
          if (userModal.mode === 'create') {
            await handleCreateUser(data as unknown as UserFormData);
          } else {
            if (!editingUserId) {
              throw new Error('ID пользователя не найден для редактирования');
            }
            await handleSaveEdit(editingUserId, data as unknown as UserFormData);
          }
        }}
        submitText={userModal.getConfig().submitText}
        loadingText={userModal.getConfig().loadingText}
      >
        {({ formData, setFormData, errors: _errors, setErrors: _setErrors }) => (
          <div className="space-y-6">
            {/* Role Selection */}
            <div>
              <fieldset>
                <legend className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Роль пользователя
                </legend>
              <div className="grid grid-cols-2 gap-3">
                <label className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  formData.role === 1 ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-gray-600'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value={1}
                    checked={formData.role === 1}
                    onChange={(e) => setFormData((prev: Record<string, unknown>) => ({ ...prev, role: Number.parseInt(e.target.value) }))}
                    className="sr-only"
                  />
                  <span className={`text-sm font-medium ${formData.role === 1 ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-700 dark:text-gray-300'}`}>
                    Студент
                  </span>
                  {formData.role === 1 && <div className="absolute top-2 right-2 w-3 h-3 bg-emerald-500 rounded-full"></div>}
                </label>
                <label className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  formData.role === 2 ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-gray-600'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value={2}
                    checked={formData.role === 2}
                    onChange={(e) => setFormData((prev: Record<string, unknown>) => ({ ...prev, role: Number.parseInt(e.target.value) }))}
                    className="sr-only"
                  />
                  <span className={`text-sm font-medium ${formData.role === 2 ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-700 dark:text-gray-300'}`}>
                    Преподаватель
                  </span>
                  {formData.role === 2 && <div className="absolute top-2 right-2 w-3 h-3 bg-emerald-500 rounded-full"></div>}
                </label>
              </div>
              </fieldset>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Login */}
              <div>
                <label htmlFor="login" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Логин
                </label>
                <input
                  id="login"
                  type="text"
                  value={(formData.login as string) || ''}
                  onChange={(e) => setFormData((prev: Record<string, unknown>) => ({ ...prev, login: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Введите логин"
                  required
                />
              </div>

              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Полное имя
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={(formData.fullName as string) || ''}
                  onChange={(e) => setFormData((prev: Record<string, unknown>) => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Введите полное имя"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <EmailInput
                  value={(formData.email as string) || ''}
                  onChange={(value: string) => setFormData((prev: Record<string, unknown>) => ({ ...prev, email: value }))}
                  error={_errors.email}
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Телефон
                </label>
                <PhoneInput
                  value={(formData.phone as string) || ''}
                  onChange={(value: string) => setFormData((prev: Record<string, unknown>) => ({ ...prev, phone: value }))}
                  error={_errors.phone}
                />
              </div>

              {/* Parent Phone - только для студентов */}
              {formData.role === 1 && (
                <div>
                  <label htmlFor="parentPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Телефон родителя <span className="text-gray-500 text-sm">(необязательно)</span>
                  </label>
                  <PhoneInput
                    value={(formData.parentPhone as string) || ''}
                    onChange={(value: string) => setFormData((prev: Record<string, unknown>) => ({ ...prev, parentPhone: value }))}
                    error={_errors.parentPhone}
                  />
                </div>
              )}

              {/* Birthday */}
              <div>
                <label htmlFor="birthday" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Дата рождения
                </label>
                <input
                  id="birthday"
                  type="date"
                  value={(formData.birthday as string) || ''}
                  onChange={(e) => setFormData((prev: Record<string, unknown>) => ({ ...prev, birthday: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Password - только при создании */}
              {userModal.mode === 'create' && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Пароль *
                  </label>
                  <PasswordInput
                    value={(formData.password as string) || ''}
                    onChange={(value: string) => setFormData((prev: Record<string, unknown>) => ({ ...prev, password: value }))}
                    required
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </UniversalModal>

      {/* Delete User Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Удалить пользователя"
        message="Вы действительно хотите удалить этого пользователя? Все данные пользователя будут безвозвратно потеряны."
        itemName={deletingUser?.name}
        danger={true}
      />
    </div>
  );
}
