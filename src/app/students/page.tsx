'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthenticatedApiService } from '../../services/AuthenticatedApiService';
import { ApiService } from '../../services/ApiService';
import { UserIcon, PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { User, UserFormData } from '../../types/User';
import EditUserModal from '../../components/EditUserModal';
import DeleteUserConfirmationModal from '../../components/DeleteUserConfirmationModal';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const pageSize = 10;

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
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

      const requestBody = {
        pageNumber: currentPage,
        pageSize: pageSize,
        search: '',
        groupIds: [],
        roleIds: [], // Empty array will get all roles
        organizationId: organizationId
      };
      
      const data = await AuthenticatedApiService.post<UsersResponse>('/User/get-users', requestBody);
      
      setStudents(data.items);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
      
    } catch (error) {
      console.error('Failed to load students:', error);
      if (error instanceof Error) {
        setError(`Ошибка загрузки: ${error.message}`);
      } else {
        setError('Не удалось загрузить список пользователей');
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, user?.organizationId]);

  useEffect(() => {
    if (isAuthenticated) {
      loadStudents();
    }
  }, [currentPage, isAuthenticated, loadStudents]);

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getRoleText = (role: number) => {
    switch (role) {
      case 1:
        return 'Администратор';
      case 2:
        return 'Преподаватель';
      case 3:
        return 'Студент';
      default:
        return 'Неизвестная роль';
    }
  };

  const getRoleColor = (role: number) => {
    switch (role) {
      case 1:
        return 'from-red-500 to-pink-500';
      case 2:
        return 'from-blue-500 to-purple-500';
      case 3:
        return 'from-green-500 to-teal-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  const handleEdit = (id: string) => {
    const student = students.find(s => s.id === id);
    if (student) {
      setEditingUser(student);
      setIsEditModalOpen(true);
    }
  };

  const handleSaveEdit = async (id: string, formData: UserFormData) => {
    try {
      const result = await ApiService.updateUser(id, formData);
      
      // Check if the update was successful (handle boolean response)
      if (result === false) {
        throw new Error('Не удалось обновить пользователя. Попробуйте еще раз.');
      }
      
      await loadStudents(); // Reload the list to show updated data
    } catch (error) {
      console.error('Error updating user:', error);
      throw error; // Re-throw to let the modal handle the error display
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
  };

  const handleDelete = (id: string) => {
    const student = students.find(s => s.id === id);
    if (student) {
      setDeletingUser(student);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async (id: string) => {
    try {
      const result = await ApiService.deleteUser(id);
      
      // Check if the deletion was successful
      if (result === false) {
        throw new Error('Не удалось удалить пользователя. Попробуйте еще раз.');
      }
      
      await loadStudents(); // Reload the list to show updated data
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error; // Re-throw to let the modal handle the error display
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingUser(null);
  };

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

  if (loading) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center card glass-card max-w-md mx-auto">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 mx-auto mb-4"
               style={{ borderColor: 'var(--primary)' }}></div>
          <p style={{ color: 'var(--muted-foreground)' }}>Загрузка пользователей...</p>
        </div>
      </div>
    );
  }

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
              onClick={loadStudents}
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
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Добавить пользователя
          </button>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  №
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Логин
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Имя
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Телефон
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Роль
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Действия</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student, index) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{(currentPage - 1) * pageSize + index + 1}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{student.login}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {student.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(student.role)}`}>
                      {getRoleText(student.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => handleEdit(student.id)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(student.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden">
          <div className="space-y-4 p-4">
            {students.map((student, index) => (
              <div key={student.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">#{(currentPage - 1) * pageSize + index + 1}</span>
                    <h3 className="text-sm font-medium text-gray-900">
                      {student.name}
                    </h3>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEdit(student.id)}
                      className="text-blue-600 hover:text-blue-900 p-1"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(student.id)}
                      className="text-red-600 hover:text-red-900 p-1"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>Логин: <span className="font-medium">{student.login}</span></div>
                  <div>Email: {student.email}</div>
                  <div>Телефон: {student.phone}</div>
                  <div className="flex items-center gap-2">
                    <span>Роль:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(student.role)}`}>
                      {getRoleText(student.role)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {students.length === 0 && !loading && (
          <div className="text-center py-12">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Нет пользователей</h3>
            <p className="mt-1 text-sm text-gray-500">
              Начните с добавления первого пользователя
            </p>
            <div className="mt-6">
              <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                <PlusIcon className="h-4 w-4 mr-2" />
                Добавить пользователя
              </button>
            </div>
          </div>
        )}

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

      {/* Delete User Confirmation Modal */}
      <DeleteUserConfirmationModal
        isOpen={isDeleteModalOpen}
        user={deletingUser}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}