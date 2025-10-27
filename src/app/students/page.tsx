'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthenticatedApiService } from '../../services/AuthenticatedApiService';
import { UserIcon, PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { User, UserFormData } from '../../types/User';
import EditUserModal from '../../components/EditUserModal';
import { DeleteConfirmationModal } from '../../components/ui/DeleteConfirmationModal';
import CreateUserModal, { CreateUserData } from '../../components/CreateUserModal';
import { UserFilters, UserFilters as UserFiltersType } from '../../components/ui/UserFilters';
import { UsersTable } from '../../components/ui/UsersTable';
import { useDebounce } from '../../hooks/useDebounce';
import { canManageUsers } from '../../types/Role';
import Link from 'next/link';

interface UsersResponse {
  items: User[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export default function StudentsPage() {
  const { isAuthenticated, user } = useAuth();
  const [students, setStudents] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filters, setFilters] = useState<UserFiltersType>({
    search: '',
    roleIds: [],
    groupIds: []
  });
  const [groups, setGroups] = useState<Array<{id: string, name: string}>>([]);
  const [tableLoading, setTableLoading] = useState(false);
  
  // Debounce search to avoid too many API calls
  const debouncedSearchTerm = useDebounce(filters.search, 300);
  
  // Track previous search term to avoid unnecessary calls
  const [prevDebouncedSearch, setPrevDebouncedSearch] = useState('');
  
  const pageSize = 10;

  const loadStudents = useCallback(async (page: number = currentPage, userFilters: UserFiltersType = filters, isTableOnly: boolean = true) => {
    try {
      if (isTableOnly) {
        setTableLoading(true);
      } else {
        // Не нужно устанавливать loading, используем только tableLoading
      }
      setError(null);
      
      const organizationId = user?.organizationId || localStorage.getItem('userOrganizationId');
      const authToken = localStorage.getItem('authToken');
      
      if (!organizationId) {
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
  }, [currentPage, user?.organizationId, debouncedSearchTerm]);

  const loadGroups = useCallback(async () => {
    try {
      const organizationId = user?.organizationId || localStorage.getItem('userOrganizationId');
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
    setCurrentPage(page);
    loadStudents(page, filters, true); // Only update table
  }, [filters]);

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
              Показано <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> до{' '}
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
                    currentPage === number
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
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

  // Check authentication after all hooks are called
  if (!isAuthenticated) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center card glass-card max-w-md mx-auto">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl mb-6"
               style={{ background: 'var(--gradient-cool)' }}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
            Требуется авторизация
          </h3>
          <p className="mb-6" style={{ color: 'var(--muted-foreground)' }}>
            Войдите в систему для управления пользователями
          </p>
          <Link
            href="/login"
            className="btn-primary hover-lift inline-flex items-center"
          >
            Войти в систему
          </Link>
        </div>
      </div>
    );
  }

  const getRoleText = (role: number) => {
    switch (role) {
      case 1:
        return 'Студент';
      case 2:
        return 'Администратор';
      case 3:
        return 'Преподаватель';
      case 4:
        return 'Владелец системы';
      default:
        return 'Неизвестная роль';
    }
  };

  const getRoleColor = (role: number) => {
    switch (role) {
      case 1:
        return 'bg-gradient-to-r from-green-500 to-teal-500 text-white'; // Студент
      case 2:
        return 'bg-gradient-to-r from-red-500 to-pink-500 text-white'; // Администратор
      case 3:
        return 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'; // Преподаватель
      case 4:
        return 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white'; // Владелец системы
      default:
        return 'bg-gradient-to-r from-gray-500 to-slate-500 text-white';
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (id: string, formData: UserFormData) => {
    try {
      const result = await AuthenticatedApiService.updateUser(id, formData);
      
      // Check if the update was successful (handle boolean response)
      if (result === false) {
        throw new Error('Не удалось обновить пользователя. Попробуйте еще раз.');
      }
      
      await loadStudents(currentPage, filters, true); // Reload only the table
    } catch (error) {
      console.error('Error updating user:', error);
      throw error; // Re-throw to let the modal handle the error display
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
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
      if (result === false) {
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

  // Create user handlers
  const handleCreateUser = async (userData: CreateUserData) => {
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
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error; // Re-throw to let the modal handle the error display
    }
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  if (error) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center card max-w-md mx-auto">
          <div className="p-6 rounded-lg border"
               style={{ 
                 background: 'rgba(239, 68, 68, 0.1)',
                 borderColor: 'var(--secondary)',
                 color: 'var(--secondary)'
               }}>
            <p className="font-medium mb-2">Ошибка загрузки</p>
            <p className="text-sm mb-4">{error}</p>
            <button
              onClick={() => loadStudents(currentPage, filters, true)}
              className="btn-primary hover-lift"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">Пользователи</h1>
          {user && canManageUsers(user.role) && (
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Добавить пользователя
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-200">
          <UserFilters
            onFilterChange={handleFilterChange}
            groups={groups}
            isLoading={tableLoading}
          />
        </div>

        {/* Users Table */}
        <UsersTable
          users={students}
          isLoading={tableLoading}
          currentUser={user}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Pagination */}
        {renderPagination()}
      </div>

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isEditModalOpen}
        user={editingUser}
        onClose={handleCloseEditModal}
        onSave={handleSaveEdit}
      />

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSave={handleCreateUser}
      />

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
