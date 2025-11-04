'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthenticatedApiService } from '../../services/AuthenticatedApiService';
import { UserGroupIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Group, GroupFormData, GroupsResponse } from '../../types/Group';
import { DeleteConfirmationModal } from '../../components/ui/DeleteConfirmationModal';
import { UniversalModal, useUniversalModal, createGroupValidator } from '../../components';
import { GroupFormUniversal } from '../../components/forms/GroupFormUniversal';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeaderWithStats } from '../../components/ui/PageHeaderWithStats';
import { useColumnVisibility, ColumnVisibilityControl } from '../../components/ui/ColumnVisibilityControl';
import { useApiToast } from '../../hooks/useApiToast';

export default function GroupsPage() {
  const { isAuthenticated, user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [tableLoading, setTableLoading] = useState(false);
  const [deletingGroup, setDeletingGroup] = useState<Group | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [viewingGroup, setViewingGroup] = useState<Group | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);

  // Универсальная система модалов для групп
  const groupModal = useUniversalModal('group', {
    name: '',
    code: '',
    level: '',
    subjectId: '',
    studentIds: [] as string[],
    organizationId: ''
  });
  
  // Toast уведомления для API операций
  const { createOperation, updateOperation, deleteOperation, loadOperation } = useApiToast();
  
  const pageSize = 10;

  // Управление видимостью колонок
  const { columns, toggleColumn, isColumnVisible } = useColumnVisibility([
    { key: 'number', label: '№', required: true },
    { key: 'name', label: 'Название группы', required: true },
    { key: 'code', label: 'Код', required: false },
    { key: 'level', label: 'Уровень', required: false },
    { key: 'subject', label: 'Предмет', required: false },
    { key: 'students', label: 'Студенты', required: true },
    { key: 'actions', label: 'Действия', required: true }
  ]);

  const loadGroups = useCallback(async (page: number = currentPage, isTableOnly: boolean = true) => {
    if (isTableOnly) {
      setTableLoading(true);
    }
    setError(null);
    
    try {
      const organizationId = user?.organizationId || localStorage.getItem('userOrganizationId');
      
      if (!organizationId) {
        setError('Не удается определить организацию пользователя');
        return;
      }

      const requestBody = {
        pageNumber: page,
        pageSize: pageSize,
        organizationId: organizationId
      };

      const response = await loadOperation(
        () => AuthenticatedApiService.post<GroupsResponse>('/Group/get-groups', requestBody),
        'группы'
      );
      
      if (response && response.items) {
        setGroups(response.items);
        setCurrentPage(response.pageNumber);
        setTotalPages(response.totalPages);
        setTotalCount(response.totalCount);
      } else {
        setGroups([]);
        setCurrentPage(1);
        setTotalPages(0);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
      setError('Ошибка при загрузке групп');
      setGroups([]);
      setCurrentPage(1);
      setTotalPages(0);
      setTotalCount(0);
    } finally {
      setTableLoading(false);
    }
  }, [currentPage, user?.organizationId]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadGroups(1, false);
    }
  }, [isAuthenticated, user]);

  const handleCreate = () => {
    setEditingGroupId(null);
    groupModal.openCreateModal();
  };

  const handleEdit = (id: string) => {
    const group = groups.find(g => g.id === id);
    if (group) {
      setEditingGroupId(id);
      groupModal.openEditModal({
        name: group.name,
        code: group.code,
        level: group.level,
        subjectId: group.subject.subjectId,
        studentIds: group.students.map(s => s.studentId),
        organizationId: '' // Заполним из контекста или API
      });
    }
  };

  const handleDelete = (id: string) => {
    const group = groups.find(g => g.id === id);
    if (group) {
      setDeletingGroup(group);
      setIsDeleteModalOpen(true);
    }
  };

  const handleView = (id: string) => {
    const group = groups.find(g => g.id === id);
    if (group) {
      setViewingGroup(group);
    }
  };

  const handleCreateGroup = async (formData: GroupFormData) => {
    const organizationId = user?.organizationId || localStorage.getItem('userOrganizationId');
    
    if (!organizationId) {
      throw new Error('Не удается определить организацию пользователя');
    }

    const dataToSend = {
      ...formData,
      organizationId: organizationId,
    };

    const result = await createOperation(
      () => AuthenticatedApiService.post('/Group/create-group', dataToSend),
      'группу'
    );
    
    // Always reload data and close modal regardless of result
    if (result.success) {
      await loadGroups(currentPage, true);
    }
    groupModal.closeModal();
  };

  const handleEditGroup = async (formData: GroupFormData) => {
    if (!editingGroupId) {
      throw new Error('ID группы не найден');
    }
    
    const result = await updateOperation(
      () => AuthenticatedApiService.put(`/Group/${editingGroupId}`, formData),
      'группу'
    );
    
    // Always reload data and close modal regardless of result
    if (result.success) {
      await loadGroups(currentPage, true);
    }
    setEditingGroupId(null);
    groupModal.closeModal();
  };

  const handleDeleteGroup = async () => {
    if (!deletingGroup) return;
    
    await deleteOperation(
      () => AuthenticatedApiService.delete(`/Group/${deletingGroup.id}`),
      'группу'
    );
    
    await loadGroups(currentPage, true);
    setIsDeleteModalOpen(false);
    setDeletingGroup(null);
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
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => loadGroups(currentPage - 1, true)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Предыдущая
            </button>
            <button
              onClick={() => loadGroups(currentPage + 1, true)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
            
            <div className="flex space-x-2">
              <button
                onClick={() => loadGroups(currentPage - 1, true)}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
              >
                ←
              </button>
              
              {pageNumbers.map((number) => (
                <button
                  key={number}
                  onClick={() => loadGroups(number, true)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 ${
                    currentPage === number
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {number}
                </button>
              ))}
              
              <button
                onClick={() => loadGroups(currentPage + 1, true)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
            <div className="text-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full w-16 h-16 mx-auto mb-4">
                <UserGroupIcon className="w-10 h-10 text-blue-600 dark:text-blue-400 mx-auto mt-1" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Требуется авторизация</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Войдите в систему для управления группами
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl rounded-xl border border-red-200/50 dark:border-red-700/50 p-6">
            <div className="text-center">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full w-16 h-16 mx-auto mb-4">
                <svg className="w-10 h-10 text-red-600 dark:text-red-400 mx-auto mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Ошибка загрузки</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">{error}</p>
              <button
                onClick={() => loadGroups(currentPage, false)}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 hover:scale-105"
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Modern Header Card */}
        <PageHeaderWithStats
          title="Группы"
          subtitle="Управление учебными группами организации"
          icon={UserGroupIcon}
          gradientFrom="teal-500"
          gradientTo="cyan-600"
          actionLabel="Добавить группу"
          onAction={handleCreate}
          extraActions={
            <ColumnVisibilityControl
              columns={columns}
              onColumnToggle={toggleColumn}
              variant="header"
            />
          }
          stats={[
            { label: "Всего групп", value: totalCount, color: "teal" },
            { label: "Текущая страница", value: currentPage, color: "cyan" },
            { label: "Всего страниц", value: totalPages, color: "blue" }
          ]}
        />

        {/* Content Card */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg rounded-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          {/* Loading State */}
          {tableLoading && (
            <div className="p-8">
              <div className="text-center">
                <div className="p-4 bg-teal-100 dark:bg-teal-900/30 rounded-full w-16 h-16 mx-auto mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 dark:border-teal-400 mx-auto mt-2"></div>
                </div>
                <p className="text-gray-600 dark:text-gray-400">Загрузка групп...</p>
              </div>
            </div>
          )}

          {/* Desktop Table View */}
          {!tableLoading && groups.length > 0 && (
            <div className="hidden md:block">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      {isColumnVisible('number') && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">#</th>
                      )}
                      {isColumnVisible('name') && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Название группы</th>
                      )}
                      {isColumnVisible('code') && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Код</th>
                      )}
                      {isColumnVisible('level') && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Уровень</th>
                      )}
                      {isColumnVisible('subject') && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Предмет</th>
                      )}
                      {isColumnVisible('students') && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Студенты</th>
                      )}
                      {isColumnVisible('actions') && (
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Действия</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {groups.map((group, index) => (
                      <tr key={group.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                        {isColumnVisible('number') && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">{(currentPage - 1) * pageSize + index + 1}</span>
                              </div>
                            </div>
                          </td>
                        )}
                        {isColumnVisible('name') && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <UserGroupIcon className="h-5 w-5 text-gray-400" />
                              <div className="font-medium text-gray-900 dark:text-gray-100">{group.name}</div>
                            </div>
                          </td>
                        )}
                        {isColumnVisible('code') && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-gray-900 dark:text-gray-100">{group.code}</div>
                          </td>
                        )}
                        {isColumnVisible('level') && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-gray-900 dark:text-gray-100">{group.level}</div>
                          </td>
                        )}
                        {isColumnVisible('subject') && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-gray-900 dark:text-gray-100">{group.subject.subjectName}</div>
                          </td>
                        )}
                        {isColumnVisible('students') && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleView(group.id)}
                              className="text-teal-600 hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-300 flex items-center"
                            >
                              <span className="font-medium">{group.students.length}</span>
                              <EyeIcon className="h-4 w-4 ml-1" />
                            </button>
                          </td>
                        )}
                        {isColumnVisible('actions') && (
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button 
                                onClick={() => handleEdit(group.id)}
                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                                title="Редактировать группу"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(group.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                                title="Удалить группу"
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
            </div>
          )}

          {/* Mobile Card View */}
          {!tableLoading && groups.length > 0 && (
            <div className="block md:hidden space-y-4 p-6">
              {groups.map((group, index) => (
                <div key={group.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow duration-200">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-lg">{(currentPage - 1) * pageSize + index + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{group.name}</h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Код: {group.code}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center space-x-3 text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Уровень:</span>
                      <span className="text-gray-600 dark:text-gray-400">{group.level}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Предмет:</span>
                      <span className="text-gray-600 dark:text-gray-400">{group.subject.subjectName}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Студенты:</span>
                      <button
                        onClick={() => handleView(group.id)}
                        className="text-teal-600 hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-300 flex items-center"
                      >
                        <span className="font-medium">{group.students.length}</span>
                        <EyeIcon className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button 
                      onClick={() => handleEdit(group.id)}
                      className="flex-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center"
                      title="Редактировать группу"
                    >
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Редактировать
                    </button>
                    <button 
                      onClick={() => handleDelete(group.id)}
                      className="flex-1 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center"
                      title="Удалить группу"
                    >
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!tableLoading && groups.length === 0 && (
            <EmptyState
              icon={UserGroupIcon}
              title="Нет групп"
              description="Начните с добавления первой группы"
              actionLabel="Добавить группу"
              onAction={handleCreate}
            />
          )}
        </div>

        {/* Pagination */}
        {renderPagination()}
      </div>

      {/* Delete Group Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteGroup}
        title="Удалить группу"
        message={`Вы уверены, что хотите удалить группу "${deletingGroup?.name}"? Это действие нельзя отменить.`}
      />

      {/* View Group Students Modal */}
      {viewingGroup && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          {/* Backdrop with blur */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
            onClick={() => setViewingGroup(null)}
          ></div>
          
          {/* Modal container */}
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 w-full max-w-md transform transition-all">
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-teal-500 to-cyan-600 px-6 py-4 rounded-t-2xl">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <UserGroupIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{viewingGroup.name}</h3>
                    <p className="text-white/80 text-sm">
                      {viewingGroup.subject.subjectName} • {viewingGroup.level}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Студенты в группе
                  </h4>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400">
                    {viewingGroup.students.length} {viewingGroup.students.length === 1 ? 'студент' :
                      viewingGroup.students.length < 5 ? 'студента' : 'студентов'}
                  </span>
                </div>
                
                <div className="max-h-60 overflow-y-auto">
                  {viewingGroup.students.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full w-12 h-12 mx-auto mb-3">
                        <UserGroupIcon className="h-6 w-6 text-gray-400 mx-auto mt-1" />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        В группе пока нет студентов
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {viewingGroup.students.map((student, index) => (
                        <div key={index} className="flex items-center p-3 bg-gray-50/80 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-600/50 transition-colors">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {(student.studentName || 'U').charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {student.studentName || 'Имя не указано'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Код группы: <span className="font-semibold text-teal-600 dark:text-teal-400">{viewingGroup.code}</span>
                  </p>
                </div>
              </div>
              
              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200/50 dark:border-gray-700/50 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => setViewingGroup(null)}
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-medium py-2.5 px-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Universal Group Modal */}
      <UniversalModal
        isOpen={groupModal.isOpen}
        mode={groupModal.mode}
        title={groupModal.getConfig().title}
        subtitle={groupModal.getConfig().subtitle}
        icon={groupModal.getConfig().icon}
        gradientFrom={groupModal.getConfig().gradientFrom}
        gradientTo={groupModal.getConfig().gradientTo}
        maxWidth="2xl"
        initialData={{
          name: '',
          code: '',
          level: '',
          subjectId: '',
          studentIds: [],
          organizationId: user?.organizationId || '',
          ...(groupModal.editData || {})
        }}
        data={groupModal.editData || undefined}
        onClose={() => {
          setEditingGroupId(null);
          groupModal.closeModal();
        }}
        validate={createGroupValidator}
        onSave={async (data: GroupFormData) => {
          if (groupModal.mode === 'create') {
            await handleCreateGroup(data);
          } else {
            await handleEditGroup(data);
          }
        }}
        submitText={groupModal.getConfig().submitText}
        loadingText={groupModal.getConfig().loadingText}
      >
        {({ formData, setFormData, errors, setErrors, isSubmitting }) => (
          <GroupFormUniversal 
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            isSubmitting={isSubmitting}
            organizationId={user?.organizationId || ''}
          />
        )}
      </UniversalModal>
    </div>
  );
}