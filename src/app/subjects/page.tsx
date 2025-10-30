'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthenticatedApiService } from '../../services/AuthenticatedApiService';
import { BookOpenIcon, PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Subject, SubjectFormData } from '../../types/Subject';
import { UniversalModal, useUniversalModal, SubjectForm, createSubjectValidator } from '../../components';
import { DeleteConfirmationModal } from '../../components/ui/DeleteConfirmationModal';
import { PageHeaderWithStats } from '../../components/ui/PageHeaderWithStats';
import { useColumnVisibility, ColumnVisibilityControl } from '../../components/ui/ColumnVisibilityControl';
import Link from 'next/link';

interface SubjectsResponse {
  items: Subject[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export default function SubjectsPage() {
  const { isAuthenticated, user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [tableLoading, setTableLoading] = useState(false);
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const pageSize = 10;

  // Универсальная система модалов
  const subjectModal = useUniversalModal('subject', {
    name: '',
    description: ''
  });

  // Управление видимостью колонок
  const { columns, toggleColumn, isColumnVisible } = useColumnVisibility([
    { key: 'number', label: '№', required: true },
    { key: 'name', label: 'Название предмета' },
    { key: 'description', label: 'Описание' },
    { key: 'actions', label: 'Действия' }
  ]);

  const loadSubjects = useCallback(async (page: number = currentPage, isTableOnly: boolean = true) => {
    try {
      if (isTableOnly) {
        setTableLoading(true);
      }
      setError(null);
      
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

      const data = await AuthenticatedApiService.post<SubjectsResponse>('/Subject/GetAllSubjects', requestBody);
      
      setSubjects(data.items);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to load subjects:', error);
      setError('Не удалось загрузить список предметов');
    } finally {
      if (isTableOnly) {
        setTableLoading(false);
      }
    }
  }, [currentPage, user?.organizationId]);

  useEffect(() => {
    if (isAuthenticated && !subjects.length) {
      loadSubjects(currentPage, true);
    }
  }, [isAuthenticated, subjects.length]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadSubjects(page, true);
  };

  // Check authentication after all hooks are called
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
            <div className="text-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full w-16 h-16 mx-auto mb-4">
                <svg className="w-10 h-10 text-blue-600 dark:text-blue-400 mx-auto mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Требуется авторизация</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                Войдите в систему для управления предметами организации
              </p>
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                Войти в систему
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleCreate = () => {
    subjectModal.openCreateModal();
  };

  const handleSaveCreate = async (formData: SubjectFormData) => {
    try {
      const organizationId = user?.organizationId || localStorage.getItem('userOrganizationId');
      
      if (!organizationId) {
        throw new Error('Не удается определить организацию пользователя');
      }

      const dataToSend = {
        ...formData,
        organizationId: organizationId,
      };

      await AuthenticatedApiService.post('/Subject/create', dataToSend);
      await loadSubjects(currentPage, true); // Reload only the table
    } catch (error) {
      console.error('Error creating subject:', error);
      throw error; // Re-throw to let the modal handle the error display
    }
  };

  const handleEdit = (id: string) => {
    const subject = subjects.find(s => s.id === id);
    if (subject) {
      subjectModal.openEditModal(subject);
    }
  };

  const handleSaveEdit = async (formData: SubjectFormData, subjectId?: string) => {
    if (!subjectId) return;
    
    try {
      await AuthenticatedApiService.put(`/Subject/${subjectId}`, formData);
      await loadSubjects(currentPage, true); // Reload only the table
    } catch (error) {
      console.error('Error updating subject:', error);
      throw error; // Re-throw to let the modal handle the error display
    }
  };

  const handleDelete = (id: string) => {
    const subject = subjects.find(s => s.id === id);
    if (subject) {
      setDeletingSubject(subject);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingSubject) return;
    
    try {
      await AuthenticatedApiService.delete(`/Subject/${deletingSubject.id}`);
      await loadSubjects(currentPage, true); // Reload only the table
      handleCloseDeleteModal();
    } catch (error) {
      console.error('Error deleting subject:', error);
      throw error; // Re-throw to let the modal handle the error display
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingSubject(null);
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
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-t border-gray-200/50 dark:border-gray-600/50">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Mobile Pagination */}
          <div className="flex justify-center sm:hidden w-full">
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Предыдущая
              </button>
              <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg">
                {currentPage} из {totalPages}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Следующая
              </button>
            </div>
          </div>

          {/* Desktop Pagination */}
          <div className="hidden sm:flex sm:items-center sm:justify-between w-full">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Показано <span className="font-semibold text-blue-600 dark:text-blue-400">{(currentPage - 1) * pageSize + 1}</span> до{' '}
              <span className="font-semibold text-blue-600 dark:text-blue-400">{Math.min(currentPage * pageSize, totalCount)}</span> из{' '}
              <span className="font-semibold text-purple-600 dark:text-purple-400">{totalCount}</span> результатов
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
              >
                ←
              </button>
              
              {pageNumbers.map((number) => (
                <button
                  key={number}
                  onClick={() => handlePageChange(number)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 ${
                    currentPage === number
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {number}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
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
                onClick={() => loadSubjects(currentPage, true)}
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Modern Header Card */}
        <PageHeaderWithStats
          title="Предметы"
          subtitle="Управление предметами организации"
          icon={BookOpenIcon}
          gradientFrom="blue-500"
          gradientTo="purple-600"
          actionLabel="Добавить предмет"
          onAction={handleCreate}
          extraActions={
            <ColumnVisibilityControl
              columns={columns}
              onColumnToggle={toggleColumn}
              variant="header"
            />
          }
          stats={[
            { label: "Всего предметов", value: totalCount, color: "violet" },
            { label: "Текущая страница", value: currentPage, color: "purple" },
            { label: "Всего страниц", value: totalPages, color: "indigo" }
          ]}
        />

        {/* Content Card */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg rounded-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          {/* Loading State */}
          {tableLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Загрузка предметов...</p>
            </div>
          )}

          {/* Desktop Table */}
          <div className="hidden md:block">{!tableLoading && (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600">
                  <tr>
                    {isColumnVisible('number') && (
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        №
                      </th>
                    )}
                    {isColumnVisible('name') && (
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Название предмета
                      </th>
                    )}
                    {isColumnVisible('description') && (
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Описание
                      </th>
                    )}
                    {isColumnVisible('actions') && (
                      <th className="relative px-6 py-4">
                        <span className="sr-only">Действия</span>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {subjects.map((subject, index) => (
                    <tr key={subject.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200">
                      {isColumnVisible('number') && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg shadow-sm">
                            {(currentPage - 1) * pageSize + index + 1}
                          </div>
                        </td>
                      )}
                      {isColumnVisible('name') && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg mr-3">
                              <BookOpenIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">{subject.name}</div>
                          </div>
                        </td>
                      )}
                      {isColumnVisible('description') && (
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate" title={subject.description}>
                            {subject.description || (
                              <span className="italic text-gray-400 dark:text-gray-500">Описание отсутствует</span>
                            )}
                          </div>
                        </td>
                      )}
                      {isColumnVisible('actions') && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button 
                              onClick={() => handleEdit(subject.id)}
                              className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-lg transition-all duration-200 hover:scale-110"
                              title="Редактировать"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(subject.id)}
                              className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded-lg transition-all duration-200 hover:scale-110"
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
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden">{!tableLoading && (
            <div className="space-y-4 p-4">
              {subjects.map((subject, index) => (
                <div key={subject.id} className="bg-gradient-to-r from-white to-blue-50 dark:from-gray-800 dark:to-gray-700 border border-gray-200/50 dark:border-gray-600/50 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg shadow-sm">
                        {(currentPage - 1) * pageSize + index + 1}
                      </div>
                      <div className="flex items-center">
                        <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg mr-2">
                          <BookOpenIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{subject.name}</h3>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEdit(subject.id)}
                        className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-lg transition-all duration-200 hover:scale-110"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(subject.id)}
                        className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded-lg transition-all duration-200 hover:scale-110"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {subject.description && (
                    <div className="mt-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-gray-200/30 dark:border-gray-600/30">
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {subject.description}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            )}
          </div>

          {/* Empty State */}
          {subjects.length === 0 && !tableLoading && (
            <div className="text-center py-12">
              <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full w-16 h-16 mx-auto mb-4">
                <BookOpenIcon className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mt-2" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Нет предметов</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Начните с добавления первого предмета в вашу организацию
              </p>
              <div className="mt-6">
                <button 
                  onClick={handleCreate}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Добавить предмет
                </button>
              </div>
            </div>
          )}

          {/* Pagination */}
          {renderPagination()}
        </div>
      </div>

      {/* Universal Subject Modal */}
      <UniversalModal
        isOpen={subjectModal.isOpen}
        onClose={subjectModal.closeModal}
        mode={subjectModal.mode}
        title={subjectModal.getConfig().title}
        subtitle={subjectModal.getConfig().subtitle}
        icon={subjectModal.getConfig().icon}
        gradientFrom={subjectModal.getConfig().gradientFrom}
        gradientTo={subjectModal.getConfig().gradientTo}
        initialData={subjectModal.initialData}
        data={subjectModal.editData || undefined}
        onSave={subjectModal.mode === 'create' ? handleSaveCreate : handleSaveEdit}
        validate={createSubjectValidator}
        submitText={subjectModal.getConfig().submitText}
        loadingText={subjectModal.getConfig().loadingText}
      >
        {(props) => <SubjectForm {...props} />}
      </UniversalModal>

      {/* Delete Subject Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Удаление предмета"
        message={`Вы уверены, что хотите удалить предмет "${deletingSubject?.name}"?`}
        itemName={deletingSubject?.name}
      />
    </div>
  );
}
