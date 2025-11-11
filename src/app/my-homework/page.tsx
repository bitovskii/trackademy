'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthenticatedApiService } from '../../services/AuthenticatedApiService';
import { ClipboardDocumentListIcon, ArrowUpTrayIcon, DocumentIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Assignment, AssignmentFilters } from '../../types/Assignment';
import { Submission, SubmissionStatus } from '../../types/Submission';
import { PageHeaderWithStats } from '../../components/ui/PageHeaderWithStats';
import { useApiToast } from '../../hooks/useApiToast';
import { BaseModal } from '../../components/ui/BaseModal';

export default function MyHomeworkPage() {
  const { isAuthenticated, user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Map<string, Submission>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Modal state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFiles, setSubmissionFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const { createOperation, updateOperation, loadOperation } = useApiToast();
  const pageSize = 10;
  const initialLoadDone = useRef(false);

  const loadAssignments = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);

    try {
      const organizationId = user?.organizationId || localStorage.getItem('userOrganizationId');

      if (!organizationId) {
        setError('Не удается определить организацию пользователя');
        return;
      }

      const requestBody: AssignmentFilters = {
        pageNumber: page,
        pageSize: pageSize,
        organizationId: organizationId
      };

      const response = await loadOperation(
        () => AuthenticatedApiService.getAssignments(requestBody),
        'задания'
      );

      if (response && response.items) {
        setAssignments(response.items);
        setCurrentPage(response.pageNumber);
        setTotalPages(response.totalPages);
        setTotalCount(response.totalCount);

        // Load submissions for these assignments
        await loadSubmissionsForAssignments(response.items);
      } else {
        setAssignments([]);
        setCurrentPage(1);
        setTotalPages(0);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
      setError('Ошибка при загрузке заданий');
      setAssignments([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.organizationId]);

  const loadSubmissionsForAssignments = async (assignmentsList: Assignment[]) => {
    try {
      const organizationId = user?.organizationId || localStorage.getItem('userOrganizationId');
      const studentId = user?.id || localStorage.getItem('userId');

      if (!organizationId || !studentId) return;

      const submissionsMap = new Map<string, Submission>();

      for (const assignment of assignmentsList) {
        const response = await AuthenticatedApiService.getSubmissions({
          pageNumber: 1,
          pageSize: 1,
          organizationId: organizationId,
          assignmentId: assignment.id,
          studentId: studentId
        });

        if (response && response.items && response.items.length > 0) {
          submissionsMap.set(assignment.id, response.items[0]);
        }
      }

      setSubmissions(submissionsMap);
    } catch (error) {
      console.error('Error loading submissions:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.organizationId && !initialLoadDone.current) {
      initialLoadDone.current = true;
      loadAssignments(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.organizationId]);

  const handleOpenSubmitModal = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    const existingSubmission = submissions.get(assignment.id);
    
    if (existingSubmission) {
      setSubmissionText(existingSubmission.textContent || '');
    } else {
      setSubmissionText('');
    }
    
    setSubmissionFiles([]);
    setIsSubmitModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSubmissionFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSubmissionFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedAssignment) return;

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('textContent', submissionText);
      
      submissionFiles.forEach((file) => {
        formData.append('files', file);
      });

      // Create or update submission
      const result = await createOperation(
        () => AuthenticatedApiService.createOrUpdateSubmission(selectedAssignment.id, formData),
        'работу'
      );

      if (result.success) {
        // Submit the submission
        const existingSubmission = submissions.get(selectedAssignment.id);
        if (existingSubmission) {
          await updateOperation(
            () => AuthenticatedApiService.submitSubmission(existingSubmission.id),
            'работу'
          );
        }

        setIsSubmitModalOpen(false);
        setSubmissionText('');
        setSubmissionFiles([]);
        await loadAssignments(currentPage);
      }
    } catch (error) {
      console.error('Error submitting homework:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusLabel = (status: SubmissionStatus) => {
    switch (status) {
      case SubmissionStatus.Draft:
        return 'Черновик';
      case SubmissionStatus.Submitted:
        return 'На проверке';
      case SubmissionStatus.Graded:
        return 'Проверено';
      case SubmissionStatus.Returned:
        return 'На доработке';
      case SubmissionStatus.Overdue:
        return 'Просрочено';
      default:
        return 'Не сдано';
    }
  };

  const getStatusColor = (status?: SubmissionStatus) => {
    if (status === undefined) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    
    switch (status) {
      case SubmissionStatus.Draft:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case SubmissionStatus.Submitted:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case SubmissionStatus.Graded:
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case SubmissionStatus.Returned:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case SubmissionStatus.Overdue:
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const handlePageChange = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      loadAssignments(page);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
        <div className="flex items-center justify-between">
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
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
            <div className="text-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full w-16 h-16 mx-auto mb-4">
                <ClipboardDocumentListIcon className="w-10 h-10 text-purple-600 dark:text-purple-400 mx-auto mt-1" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Требуется авторизация</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Войдите в систему для просмотра заданий
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeaderWithStats
          title="Мои задания"
          subtitle="Просматривайте задания и сдавайте выполненные работы"
          icon={ClipboardDocumentListIcon}
          gradientFrom="purple-500"
          gradientTo="indigo-600"
          stats={[
            { label: "Всего заданий", value: totalCount, color: "purple" },
            { label: "Текущая страница", value: currentPage, color: "indigo" },
            { label: "Всего страниц", value: totalPages, color: "blue" }
          ]}
        />

        {/* Table */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg rounded-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          {loading && (
            <div className="p-8">
              <div className="text-center">
                <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full w-16 h-16 mx-auto mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 dark:border-purple-400 mx-auto mt-2"></div>
                </div>
                <p className="text-gray-600 dark:text-gray-400">Загрузка заданий...</p>
              </div>
            </div>
          )}

          {!loading && assignments.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                      №
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                      Описание
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                      Группа
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                      Дедлайн
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                      Оценка
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {assignments.map((assignment, index) => {
                    const submission = submissions.get(assignment.id);
                    const overdue = isOverdue(assignment.dueDate);
                    
                    return (
                      <tr 
                        key={assignment.id} 
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-medium rounded-lg shadow-sm">
                            {(currentPage - 1) * pageSize + index + 1}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white max-w-md break-words">
                            {assignment.description || 'Без описания'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{assignment.group.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{assignment.group.code}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${
                            overdue && !submission
                              ? 'text-red-600 dark:text-red-400' 
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {formatDate(assignment.dueDate)}
                          </div>
                          {overdue && !submission && (
                            <div className="text-xs text-red-500 dark:text-red-400">Просрочено</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(submission?.status)}`}>
                            {submission ? getStatusLabel(submission.status) : 'Не сдано'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {submission?.score !== null && submission?.score !== undefined ? (
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {submission.score}/100
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 dark:text-gray-400">—</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleOpenSubmitModal(assignment)}
                            disabled={submission?.status === SubmissionStatus.Graded}
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                          >
                            <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
                            {submission ? 'Редактировать' : 'Сдать'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && assignments.length === 0 && (
            <div className="text-center py-16 p-6">
              <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full w-16 h-16 mx-auto mb-6">
                <ClipboardDocumentListIcon className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mt-2" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Нет заданий
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                У вас пока нет заданий для выполнения
              </p>
            </div>
          )}
        </div>

        {renderPagination()}
      </div>

      {/* Submit Modal */}
      <BaseModal
        isOpen={isSubmitModalOpen}
        onClose={() => {
          setIsSubmitModalOpen(false);
          setSelectedAssignment(null);
          setSubmissionText('');
          setSubmissionFiles([]);
        }}
        title={`Сдать работу: ${selectedAssignment?.description.substring(0, 50)}${(selectedAssignment?.description.length || 0) > 50 ? '...' : ''}`}
        customBackground="bg-gray-800 dark:bg-gray-800"
        gradientFrom="from-purple-500"
        gradientTo="to-indigo-600"
        maxWidth="xl"
      >
        <div className="space-y-4">
          {/* Assignment Info */}
          {selectedAssignment && (
            <div className="bg-gray-700 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Группа:</span>
                  <span className="ml-2 text-white font-medium">{selectedAssignment.group.name}</span>
                </div>
                <div>
                  <span className="text-gray-400">Дедлайн:</span>
                  <span className={`ml-2 font-medium ${
                    isOverdue(selectedAssignment.dueDate) 
                      ? 'text-red-400' 
                      : 'text-white'
                  }`}>
                    {formatDate(selectedAssignment.dueDate)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Text Content */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Текст работы
            </label>
            <textarea
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              rows={6}
              placeholder="Введите текст вашей работы..."
              className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Прикрепить файлы
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ArrowUpTrayIcon className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-400">
                    <span className="font-semibold">Нажмите для выбора</span> или перетащите файлы
                  </p>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, PNG (MAX. 10MB)</p>
                </div>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </label>
            </div>
          </div>

          {/* File List */}
          {submissionFiles.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Выбранные файлы ({submissionFiles.length})
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {submissionFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-700 rounded-lg p-3"
                  >
                    <div className="flex items-center space-x-3">
                      <DocumentIcon className="h-5 w-5 text-purple-400" />
                      <div>
                        <div className="text-sm text-white">{file.name}</div>
                        <div className="text-xs text-gray-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveFile(index)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-700">
            <button
              onClick={() => {
                setIsSubmitModalOpen(false);
                setSelectedAssignment(null);
                setSubmissionText('');
                setSubmissionFiles([]);
              }}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              Отмена
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || (!submissionText && submissionFiles.length === 0)}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 inline-flex items-center"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Отправка...
                </>
              ) : (
                <>
                  <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
                  Сдать работу
                </>
              )}
            </button>
          </div>
        </div>
      </BaseModal>
    </div>
  );
}
