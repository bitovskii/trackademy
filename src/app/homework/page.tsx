'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthenticatedApiService } from '../../services/AuthenticatedApiService';
import { ClipboardDocumentListIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Assignment, AssignmentFormData, AssignmentsResponse, AssignmentFilters } from '../../types/Assignment';
import { Submission, SubmissionFilters, SubmissionsResponse, SubmissionStatus } from '../../types/Submission';
import { PageHeaderWithStats } from '../../components/ui/PageHeaderWithStats';
import { useApiToast } from '../../hooks/useApiToast';
import { DeleteConfirmationModal } from '../../components/ui/DeleteConfirmationModal';
import { BaseModal } from '../../components/ui/BaseModal';
import { DateRangePicker } from '../../components/ui/DateRangePicker';

export default function HomeworkPage() {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'assignments' | 'checking'>('assignments');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [groups, setGroups] = useState<Array<{id: string, name: string}>>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [tableLoading, setTableLoading] = useState(false);
  const [deletingAssignment, setDeletingAssignment] = useState<Assignment | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState<AssignmentFormData>({
    description: '',
    groupId: '',
    assignedDate: '',
    dueDate: ''
  });
  const [modalDueDate, setModalDueDate] = useState<string>('');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Submissions tab state
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submissionsCurrentPage, setSubmissionsCurrentPage] = useState(1);
  const [submissionsTotalPages, setSubmissionsTotalPages] = useState(0);
  const [submissionsTotalCount, setSubmissionsTotalCount] = useState(0);
  const [submissionsTableLoading, setSubmissionsTableLoading] = useState(false);
  const [submissionFilters, setSubmissionFilters] = useState<{
    assignmentId: string;
    groupId: string;
    studentId: string;
    status: string;
    fromDate: string;
    toDate: string;
  }>({
    assignmentId: '',
    groupId: '',
    studentId: '',
    status: '',
    fromDate: '',
    toDate: ''
  });
  const [students, setStudents] = useState<Array<{id: string, name: string}>>([]);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);

  const [filters, setFilters] = useState<{
    groupId: string;
    fromDate: string;
    toDate: string;
  }>({
    groupId: '',
    fromDate: '',
    toDate: ''
  });

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const submissionFiltersRef = useRef(submissionFilters);
  submissionFiltersRef.current = submissionFilters;

  const { createOperation, updateOperation, deleteOperation, loadOperation } = useApiToast();

  const pageSize = 10;
  const initialLoadDone = useRef(false);
  const submissionsInitialLoadDone = useRef(false);

  const loadAssignments = useCallback(async (page: number, isTableOnly: boolean = true) => {
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

      const currentFilters = filtersRef.current;

      const requestBody: AssignmentFilters = {
        pageNumber: page,
        pageSize: pageSize,
        organizationId: organizationId
      };

      if (currentFilters.groupId) {
        requestBody.groupId = currentFilters.groupId;
      }
      if (currentFilters.fromDate) {
        requestBody.fromDate = new Date(currentFilters.fromDate).toISOString();
      }
      if (currentFilters.toDate) {
        requestBody.toDate = new Date(currentFilters.toDate).toISOString();
      }

      const response = await loadOperation(
        () => AuthenticatedApiService.getAssignments(requestBody),
        'задания'
      );

      if (response && response.items) {
        setAssignments(response.items);
        setCurrentPage(response.pageNumber);
        setTotalPages(response.totalPages);
        setTotalCount(response.totalCount);
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
      setCurrentPage(1);
      setTotalPages(0);
      setTotalCount(0);
    } finally {
      setTableLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.organizationId]);

  const loadGroups = useCallback(async () => {
    try {
      const organizationId = user?.organizationId || localStorage.getItem('userOrganizationId');
      if (!organizationId) return;

      const requestBody = {
        pageNumber: 1,
        pageSize: 1000,
        organizationId: organizationId
      };

      const response = await AuthenticatedApiService.post<{items: Array<{id: string, name: string}>}>('/Group/get-groups', requestBody);
      if (response && response.items) {
        setGroups(response.items);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.organizationId]);

  const loadStudents = useCallback(async () => {
    try {
      const organizationId = user?.organizationId || localStorage.getItem('userOrganizationId');
      if (!organizationId) return;

      const requestBody = {
        pageNumber: 1,
        pageSize: 1000,
        organizationId: organizationId,
        roleIds: [1] // Student role
      };

      const response = await AuthenticatedApiService.post<{items: Array<{id: string, name: string}>}>('/User/get-users', requestBody);
      if (response && response.items) {
        setStudents(response.items.map(student => ({
          id: student.id,
          name: student.name || 'Без имени'
        })));
      }
    } catch (error) {
      console.error('Error loading students:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.organizationId]);

  const loadSubmissions = useCallback(async (page: number, isTableOnly: boolean = true) => {
    if (isTableOnly) {
      setSubmissionsTableLoading(true);
    }
    setError(null);

    try {
      const organizationId = user?.organizationId || localStorage.getItem('userOrganizationId');

      if (!organizationId) {
        setError('Не удается определить организацию пользователя');
        return;
      }

      const currentFilters = submissionFiltersRef.current;

      const requestBody: SubmissionFilters = {
        pageNumber: page,
        pageSize: pageSize,
        organizationId: organizationId
      };

      if (currentFilters.assignmentId) {
        requestBody.assignmentId = currentFilters.assignmentId;
      }
      if (currentFilters.groupId) {
        requestBody.groupId = currentFilters.groupId;
      }
      if (currentFilters.studentId) {
        requestBody.studentId = currentFilters.studentId;
      }
      if (currentFilters.status) {
        requestBody.status = parseInt(currentFilters.status) as SubmissionStatus;
      }
      if (currentFilters.fromDate) {
        requestBody.fromDate = new Date(currentFilters.fromDate).toISOString();
      }
      if (currentFilters.toDate) {
        requestBody.toDate = new Date(currentFilters.toDate).toISOString();
      }

      const response = await loadOperation(
        () => AuthenticatedApiService.getSubmissions(requestBody),
        'работы студентов'
      );

      if (response && response.items) {
        setSubmissions(response.items);
        setSubmissionsCurrentPage(response.pageNumber);
        setSubmissionsTotalPages(response.totalPages);
        setSubmissionsTotalCount(response.totalCount);
      } else {
        setSubmissions([]);
        setSubmissionsCurrentPage(1);
        setSubmissionsTotalPages(0);
        setSubmissionsTotalCount(0);
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
      setError('Ошибка при загрузке работ студентов');
      setSubmissions([]);
      setSubmissionsCurrentPage(1);
      setSubmissionsTotalPages(0);
      setSubmissionsTotalCount(0);
    } finally {
      setSubmissionsTableLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.organizationId]);

  useEffect(() => {
    if (isAuthenticated && user?.organizationId && !initialLoadDone.current) {
      initialLoadDone.current = true;
      loadGroups();
      loadStudents();
      loadAssignments(1, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.organizationId]);

  useEffect(() => {
    if (activeTab === 'checking' && isAuthenticated && user?.organizationId && !submissionsInitialLoadDone.current) {
      submissionsInitialLoadDone.current = true;
      loadSubmissions(1, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isAuthenticated, user?.organizationId]);

  useEffect(() => {
    if (!initialLoadDone.current) {
      return;
    }

    if (isAuthenticated && user?.organizationId) {
      setCurrentPage(1);
      loadAssignments(1, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.groupId, filters.fromDate, filters.toDate]);

  useEffect(() => {
    if (!submissionsInitialLoadDone.current) {
      return;
    }

    if (isAuthenticated && user?.organizationId && activeTab === 'checking') {
      setSubmissionsCurrentPage(1);
      loadSubmissions(1, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissionFilters.assignmentId, submissionFilters.groupId, submissionFilters.studentId, submissionFilters.status, submissionFilters.fromDate, submissionFilters.toDate]);

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      groupId: '',
      fromDate: '',
      toDate: ''
    });
    setCurrentPage(1);
    loadAssignments(1, true);
  };

  const handleSubmissionFilterChange = (newFilters: Partial<typeof submissionFilters>) => {
    setSubmissionFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleResetSubmissionFilters = () => {
    setSubmissionFilters({
      assignmentId: '',
      groupId: '',
      studentId: '',
      status: '',
      fromDate: '',
      toDate: ''
    });
    setStudentSearchQuery('');
    setSubmissionsCurrentPage(1);
    loadSubmissions(1, true);
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(studentSearchQuery.toLowerCase())
  );

  const selectedStudent = students.find(s => s.id === submissionFilters.studentId);

  const handleStudentSelect = (studentId: string) => {
    handleSubmissionFilterChange({ studentId });
    setIsStudentDropdownOpen(false);
    const student = students.find(s => s.id === studentId);
    if (student) {
      setStudentSearchQuery(student.name);
    }
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
        return 'Неизвестно';
    }
  };

  const getStatusColor = (status: SubmissionStatus) => {
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

  const handleSubmissionsPageChange = (page: number) => {
    if (page !== submissionsCurrentPage && page >= 1 && page <= submissionsTotalPages) {
      loadSubmissions(page, true);
    }
  };

  const handleCreate = () => {
    setEditingAssignmentId(null);
    setModalMode('create');
    setFormData({
      description: '',
      groupId: '',
      assignedDate: '',
      dueDate: ''
    });
    setModalDueDate('');
    setIsAssignmentModalOpen(true);
  };

  const handleEdit = (id: string) => {
    const assignment = assignments.find(a => a.id === id);
    if (assignment) {
      setEditingAssignmentId(id);
      setModalMode('edit');
      setFormData({
        description: assignment.description,
        groupId: assignment.groupId,
        assignedDate: assignment.assignedDate.split('T')[0],
        dueDate: assignment.dueDate.split('T')[0]
      });
      setModalDueDate(assignment.dueDate.split('T')[0]);
      setIsAssignmentModalOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    const assignment = assignments.find(a => a.id === id);
    if (assignment) {
      setDeletingAssignment(assignment);
      setIsDeleteModalOpen(true);
    }
  };

  const handleSave = async () => {
    if (!formData.description || !formData.groupId || !modalDueDate) {
      return;
    }

    // Устанавливаем дату назначения как текущую дату
    const assignedDate = new Date().toISOString();
    const dueDate = new Date(modalDueDate).toISOString();

    if (modalMode === 'create') {
      const result = await createOperation(
        () => AuthenticatedApiService.createAssignment({
          description: formData.description,
          groupId: formData.groupId,
          assignedDate: assignedDate,
          dueDate: dueDate
        }),
        'задание'
      );

      if (result.success) {
        await loadAssignments(currentPage, true);
        setIsAssignmentModalOpen(false);
      }
    } else {
      if (!editingAssignmentId) {
        return;
      }

      const result = await updateOperation(
        () => AuthenticatedApiService.updateAssignment(editingAssignmentId, {
          description: formData.description,
          assignedDate: assignedDate,
          dueDate: dueDate
        }),
        'задание'
      );

      if (result.success) {
        await loadAssignments(currentPage, true);
        setIsAssignmentModalOpen(false);
        setEditingAssignmentId(null);
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingAssignment) return;

    const result = await deleteOperation(
      () => AuthenticatedApiService.deleteAssignment(deletingAssignment.id),
      'задание'
    );

    if (result.success) {
      await loadAssignments(currentPage, true);
    }
    setIsDeleteModalOpen(false);
    setDeletingAssignment(null);
  };

  const handlePageChange = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      loadAssignments(page, true);
    }
  };

  const handleRowClick = async (id: string) => {
    setDetailLoading(true);
    setIsDetailModalOpen(true);
    
    try {
      const assignment = await loadOperation(
        () => AuthenticatedApiService.getAssignmentById(id),
        'задание'
      );
      
      if (assignment) {
        setSelectedAssignment(assignment);
      }
    } catch (error) {
      console.error('Error loading assignment details:', error);
      setIsDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
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

  const renderSubmissionsPagination = () => {
    if (submissionsTotalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, submissionsCurrentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(submissionsTotalPages, startPage + maxVisiblePages - 1);

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
                Показано <span className="font-medium">{((submissionsCurrentPage - 1) * pageSize) + 1}</span> по{' '}
                <span className="font-medium">{Math.min(submissionsCurrentPage * pageSize, submissionsTotalCount)}</span> из{' '}
                <span className="font-medium">{submissionsTotalCount}</span> результатов
              </p>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleSubmissionsPageChange(submissionsCurrentPage - 1)}
                disabled={submissionsCurrentPage === 1}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
              >
                ←
              </button>

              {pageNumbers.map((number) => (
                <button
                  key={number}
                  onClick={() => handleSubmissionsPageChange(number)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 ${
                    submissionsCurrentPage === number
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {number}
                </button>
              ))}

              <button
                onClick={() => handleSubmissionsPageChange(submissionsCurrentPage + 1)}
                disabled={submissionsCurrentPage === submissionsTotalPages}
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
                Войдите в систему для управления домашними заданиями
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
          title="Домашнее задание"
          subtitle="Управление заданиями и проверка выполненных работ"
          icon={ClipboardDocumentListIcon}
          gradientFrom="purple-500"
          gradientTo="indigo-600"
          actionLabel="Добавить задание"
          onAction={handleCreate}
          stats={[
            { label: "Всего заданий", value: totalCount, color: "purple" },
            { label: "Текущая страница", value: currentPage, color: "indigo" },
            { label: "Всего страниц", value: totalPages, color: "blue" }
          ]}
        />

        {/* Custom Tabs */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg rounded-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('assignments')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 relative ${
                activeTab === 'assignments'
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span className="relative z-10">Задания</span>
              {activeTab === 'assignments' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('checking')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 relative ${
                activeTab === 'checking'
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span className="relative z-10">Проверка домашнего задания</span>
              {activeTab === 'checking' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-600" />
              )}
            </button>
          </div>
        </div>

        {activeTab === 'assignments' && (
          <>
            {/* Filters */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Фильтры</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Group Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Группа
                  </label>
                  <select
                    value={filters.groupId}
                    onChange={(e) => handleFilterChange({ groupId: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-900 dark:text-white transition-all duration-200"
                  >
                    <option value="">Все группы</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Range Picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Период
                  </label>
                  <DateRangePicker
                    startDate={filters.fromDate}
                    endDate={filters.toDate}
                    onDateChange={(fromDate, toDate) => {
                      handleFilterChange({ fromDate: fromDate || '', toDate: toDate || '' });
                    }}
                    placeholder="Выберите период"
                  />
                </div>
              </div>

              {/* Reset Button */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Сбросить фильтры
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg rounded-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
              {tableLoading && (
                <div className="p-8">
                  <div className="text-center">
                    <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full w-16 h-16 mx-auto mb-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 dark:border-purple-400 mx-auto mt-2"></div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">Загрузка заданий...</p>
                  </div>
                </div>
              )}

              {!tableLoading && assignments.length > 0 && (
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
                          Дата назначения
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                          Дедлайн
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                          Действия
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {assignments.map((assignment, index) => (
                        <tr 
                          key={assignment.id} 
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                          onClick={() => handleRowClick(assignment.id)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-medium rounded-lg shadow-sm">
                              {(currentPage - 1) * pageSize + index + 1}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 dark:text-white max-w-md truncate">
                              {assignment.description || 'Без описания'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">{assignment.group.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{assignment.group.code}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">{formatDate(assignment.assignedDate)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-medium ${
                              isOverdue(assignment.dueDate) 
                                ? 'text-red-600 dark:text-red-400' 
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {formatDate(assignment.dueDate)}
                            </div>
                            {isOverdue(assignment.dueDate) && (
                              <div className="text-xs text-red-500 dark:text-red-400">Просрочено</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(assignment.id)}
                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 transition-colors"
                                title="Редактировать"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(assignment.id)}
                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                                title="Удалить"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!tableLoading && assignments.length === 0 && (
                <div className="text-center py-16 p-6">
                  <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full w-16 h-16 mx-auto mb-6">
                    <ClipboardDocumentListIcon className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mt-2" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {filters.groupId || filters.fromDate || filters.toDate ? 'Задания не найдены' : 'Нет заданий'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {filters.groupId || filters.fromDate || filters.toDate
                      ? 'Попробуйте изменить критерии поиска'
                      : 'Создайте первое задание для начала работы'
                    }
                  </p>
                  <button
                    onClick={filters.groupId || filters.fromDate || filters.toDate ? handleResetFilters : handleCreate}
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 hover:scale-105 inline-flex items-center"
                  >
                    {filters.groupId || filters.fromDate || filters.toDate ? (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Сбросить фильтры
                      </>
                    ) : (
                      <>
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Создать задание
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {renderPagination()}
          </>
        )}

        {activeTab === 'checking' && (
          <>
            {/* Filters */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Фильтры</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Assignment Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Задание
                  </label>
                  <select
                    value={submissionFilters.assignmentId}
                    onChange={(e) => handleSubmissionFilterChange({ assignmentId: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-900 dark:text-white transition-all duration-200"
                  >
                    <option value="">Все задания</option>
                    {assignments.map((assignment) => (
                      <option key={assignment.id} value={assignment.id}>
                        {assignment.description.substring(0, 50)}{assignment.description.length > 50 ? '...' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Group Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Группа
                  </label>
                  <select
                    value={submissionFilters.groupId}
                    onChange={(e) => handleSubmissionFilterChange({ groupId: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-900 dark:text-white transition-all duration-200"
                  >
                    <option value="">Все группы</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Student Filter with Search */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Студент
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={studentSearchQuery || (selectedStudent?.name || '')}
                      onChange={(e) => {
                        setStudentSearchQuery(e.target.value);
                        setIsStudentDropdownOpen(true);
                        if (!e.target.value) {
                          handleSubmissionFilterChange({ studentId: '' });
                        }
                      }}
                      onFocus={() => setIsStudentDropdownOpen(true)}
                      placeholder="Поиск студента..."
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-900 dark:text-white transition-all duration-200"
                    />
                    {submissionFilters.studentId && (
                      <button
                        onClick={() => {
                          handleSubmissionFilterChange({ studentId: '' });
                          setStudentSearchQuery('');
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  {isStudentDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsStudentDropdownOpen(false)}
                      />
                      <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredStudents.length > 0 ? (
                          <>
                            <button
                              onClick={() => {
                                handleSubmissionFilterChange({ studentId: '' });
                                setStudentSearchQuery('');
                                setIsStudentDropdownOpen(false);
                              }}
                              className="w-full px-3 py-2 text-left text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            >
                              Все студенты
                            </button>
                            {filteredStudents.map((student) => (
                              <button
                                key={student.id}
                                onClick={() => handleStudentSelect(student.id)}
                                className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                                  submissionFilters.studentId === student.id
                                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                    : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600'
                                }`}
                              >
                                {student.name}
                              </button>
                            ))}
                          </>
                        ) : (
                          <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                            Студенты не найдены
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Статус
                  </label>
                  <select
                    value={submissionFilters.status}
                    onChange={(e) => handleSubmissionFilterChange({ status: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-900 dark:text-white transition-all duration-200"
                  >
                    <option value="">Все статусы</option>
                    <option value="0">Черновик</option>
                    <option value="1">На проверке</option>
                    <option value="2">Проверено</option>
                    <option value="3">На доработке</option>
                    <option value="4">Просрочено</option>
                  </select>
                </div>

                {/* Date Range Picker */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Период
                  </label>
                  <DateRangePicker
                    startDate={submissionFilters.fromDate}
                    endDate={submissionFilters.toDate}
                    onDateChange={(fromDate, toDate) => {
                      handleSubmissionFilterChange({ fromDate: fromDate || '', toDate: toDate || '' });
                    }}
                    placeholder="Выберите период"
                  />
                </div>
              </div>

              {/* Reset Button */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleResetSubmissionFilters}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Сбросить фильтры
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg rounded-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
              {submissionsTableLoading && (
                <div className="p-8">
                  <div className="text-center">
                    <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full w-16 h-16 mx-auto mb-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 dark:border-purple-400 mx-auto mt-2"></div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">Загрузка работ студентов...</p>
                  </div>
                </div>
              )}

              {!submissionsTableLoading && submissions.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                          №
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                          Студент
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                          Задание
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                          Группа
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                          Статус
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                          Оценка
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                          Дата сдачи
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {submissions.map((submission, index) => (
                        <tr 
                          key={submission.id} 
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-medium rounded-lg shadow-sm">
                              {(submissionsCurrentPage - 1) * pageSize + index + 1}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white font-medium">{submission.studentName}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 dark:text-white max-w-md truncate">
                              {submission.assignment?.description || 'Без описания'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {submission.group && (
                              <>
                                <div className="text-sm text-gray-900 dark:text-white">{submission.group.name}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{submission.group.code}</div>
                              </>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(submission.status)}`}>
                              {getStatusLabel(submission.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {submission.score !== null ? (
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {submission.score}/100
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500 dark:text-gray-400">—</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {submission.submittedAt ? (
                              <div className="text-sm text-gray-900 dark:text-white">{formatDate(submission.submittedAt)}</div>
                            ) : (
                              <div className="text-sm text-gray-500 dark:text-gray-400">Не сдано</div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!submissionsTableLoading && submissions.length === 0 && (
                <div className="text-center py-16 p-6">
                  <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full w-16 h-16 mx-auto mb-6">
                    <ClipboardDocumentListIcon className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mt-2" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {Object.values(submissionFilters).some(v => v) ? 'Работы не найдены' : 'Нет работ'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {Object.values(submissionFilters).some(v => v)
                      ? 'Попробуйте изменить критерии поиска'
                      : 'Студенты еще не сдали работы'
                    }
                  </p>
                  {Object.values(submissionFilters).some(v => v) && (
                    <button
                      onClick={handleResetSubmissionFilters}
                      className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 hover:scale-105 inline-flex items-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Сбросить фильтры
                    </button>
                  )}
                </div>
              )}
            </div>

            {renderSubmissionsPagination()}
          </>
        )}
      </div>

      {/* Assignment Modal */}
      <BaseModal
        isOpen={isAssignmentModalOpen}
        onClose={() => {
          setIsAssignmentModalOpen(false);
          setEditingAssignmentId(null);
        }}
        title={modalMode === 'create' ? 'Создать задание' : 'Редактировать задание'}
        customBackground="bg-gray-800 dark:bg-gray-800"
        gradientFrom="from-purple-500"
        gradientTo="to-indigo-600"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Описание *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="Опишите задание..."
              className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Группа *
            </label>
            <select
              value={formData.groupId}
              onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
              disabled={modalMode === 'edit'}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Выберите группу</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
            {modalMode === 'edit' && (
              <p className="mt-1 text-xs text-gray-400">
                Группу нельзя изменить после создания задания
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Дедлайн *
            </label>
            <input
              type="date"
              value={modalDueDate}
              onChange={(e) => setModalDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-700 text-white"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-700">
            <button
              onClick={() => {
                setIsAssignmentModalOpen(false);
                setEditingAssignmentId(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              disabled={!formData.description || !formData.groupId || !modalDueDate}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {modalMode === 'create' ? 'Создать' : 'Сохранить'}
            </button>
          </div>
        </div>
      </BaseModal>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingAssignment(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Удалить задание"
        message={`Вы уверены, что хотите удалить задание "${deletingAssignment?.description}"? Это действие нельзя отменить.`}
      />

      {/* Assignment Detail Modal */}
      <BaseModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedAssignment(null);
        }}
        title="Детали задания"
        customBackground="bg-gray-800 dark:bg-gray-800"
        gradientFrom="from-purple-500"
        gradientTo="to-indigo-600"
        maxWidth="xl"
      >
        {detailLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : selectedAssignment ? (
          <div className="space-y-6">
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Описание
              </label>
              <div className="bg-gray-700 rounded-lg p-4 text-white break-words overflow-wrap-anywhere">
                {selectedAssignment.description || 'Описание отсутствует'}
              </div>
            </div>

            {/* Group Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Группа
                </label>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-white font-medium">{selectedAssignment.group.name}</div>
                  <div className="text-gray-400 text-sm">{selectedAssignment.group.code}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Статус
                </label>
                <div className="bg-gray-700 rounded-lg p-4">
                  {isOverdue(selectedAssignment.dueDate) ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-red-400 font-medium">Просрочено</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-green-400 font-medium">Активно</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Дата назначения
                </label>
                <div className="bg-gray-700 rounded-lg p-4 text-white">
                  {formatDate(selectedAssignment.assignedDate)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Дедлайн
                </label>
                <div className={`bg-gray-700 rounded-lg p-4 font-medium ${
                  isOverdue(selectedAssignment.dueDate) 
                    ? 'text-red-400' 
                    : 'text-white'
                }`}>
                  {formatDate(selectedAssignment.dueDate)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Дата создания
                </label>
                <div className="bg-gray-700 rounded-lg p-4 text-white">
                  {formatDate(selectedAssignment.createdAt)}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-700">
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedAssignment(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Закрыть
              </button>
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleEdit(selectedAssignment.id);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                Редактировать
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            Не удалось загрузить данные
          </div>
        )}
      </BaseModal>
    </div>
  );
}
