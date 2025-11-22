'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthenticatedApiService } from '../../services/AuthenticatedApiService';
import { ClipboardDocumentListIcon, CalendarIcon, ClockIcon, CheckCircleIcon, XCircleIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { MyAssignment, MyAssignmentsResponse } from '../../types/MyAssignments';
import { PageHeaderWithStats } from '../../components/ui/PageHeaderWithStats';
import { useApiToast } from '../../hooks/useApiToast';
import { BaseModal } from '../../components/ui/BaseModal';

export default function MyHomeworkPage() {
  const { isAuthenticated, user } = useAuth();
  const [myAssignments, setMyAssignments] = useState<MyAssignmentsResponse>({
    pending: [],
    submitted: [],
    graded: [],
    overdue: []
  });
  const [loading, setLoading] = useState(false);
  
  // Modal state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<MyAssignment | null>(null);

  const { loadOperation } = useApiToast();

  const loadMyAssignments = async () => {
    setLoading(true);
    try {
      const organizationId = user?.organizationId || localStorage.getItem('userOrganizationId');
      if (!organizationId) return;

      const response = await loadOperation(
        () => AuthenticatedApiService.getMyAssignments({ OrganizationId: organizationId }),
        'мои задания'
      );

      if (response) {
        setMyAssignments(response);
      }
    } catch (error) {
      console.error('Error loading my assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      loadMyAssignments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  const handleCardClick = (assignment: MyAssignment) => {
    setSelectedAssignment(assignment);
    setIsDetailModalOpen(true);
  };

  const getTotalCount = () => {
    return myAssignments.overdue.length + 
           myAssignments.pending.length + 
           myAssignments.submitted.length + 
           myAssignments.graded.length;
  };



  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Требуется авторизация</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 pt-10 md:pt-12">
        {/* Header */}
        <PageHeaderWithStats
          icon={ClipboardDocumentListIcon}
          title="Мои домашние задания"
          subtitle="Список всех заданий с группировкой по статусам"
          gradientFrom="blue-500"
          gradientTo="purple-600"
          stats={[
            { label: "Всего заданий", value: getTotalCount(), color: "blue" },
            { label: "Просрочено", value: myAssignments.overdue.length, color: "red" },
            { label: "К выполнению", value: myAssignments.pending.length, color: "indigo" },
            { label: "На проверке", value: myAssignments.submitted.length, color: "cyan" },
            { label: "Проверено", value: myAssignments.graded.length, color: "green" }
          ]}
        />

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Overdue Section */}
            {myAssignments.overdue.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <XCircleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Просрочено ({myAssignments.overdue.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myAssignments.overdue.map((assignment) => (
                    <AssignmentCard 
                      key={assignment.assignmentId} 
                      assignment={assignment} 
                      statusColor="red"
                      onClick={() => handleCardClick(assignment)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Pending Section */}
            {myAssignments.pending.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <ClockIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    К выполнению ({myAssignments.pending.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myAssignments.pending.map((assignment) => (
                    <AssignmentCard 
                      key={assignment.assignmentId} 
                      assignment={assignment} 
                      statusColor="gray"
                      onClick={() => handleCardClick(assignment)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Submitted Section */}
            {myAssignments.submitted.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    На проверке ({myAssignments.submitted.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myAssignments.submitted.map((assignment) => (
                    <AssignmentCard 
                      key={assignment.assignmentId} 
                      assignment={assignment} 
                      statusColor="blue"
                      onClick={() => handleCardClick(assignment)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Graded Section */}
            {myAssignments.graded.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Проверено ({myAssignments.graded.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myAssignments.graded.map((assignment) => (
                    <AssignmentCard 
                      key={assignment.assignmentId} 
                      assignment={assignment} 
                      statusColor="green"
                      onClick={() => handleCardClick(assignment)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {getTotalCount() === 0 && !loading && (
              <div className="text-center py-12">
                <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Нет заданий</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  У вас пока нет домашних заданий
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <BaseModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedAssignment(null);
        }}
        title="Детали задания"
      >
        <div className="p-6">
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
              <AcademicCapIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              В разработке
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Функционал сдачи работы находится в разработке
            </p>
          </div>
        </div>
      </BaseModal>
    </div>
  );
}

interface AssignmentCardProps {
  assignment: MyAssignment;
  statusColor: 'red' | 'gray' | 'blue' | 'green';
  onClick: () => void;
}

function AssignmentCard({ assignment, statusColor, onClick }: AssignmentCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'short'
    });
  };

  const borderColors = {
    red: 'border-l-red-500',
    gray: 'border-l-gray-500',
    blue: 'border-l-blue-500',
    green: 'border-l-green-500'
  };

  const bgColors = {
    red: 'hover:bg-red-50 dark:hover:bg-red-900/10',
    gray: 'hover:bg-gray-50 dark:hover:bg-gray-700',
    blue: 'hover:bg-blue-50 dark:hover:bg-blue-900/10',
    green: 'hover:bg-green-50 dark:hover:bg-green-900/10'
  };

  const getStatusBadge = () => {
    if (assignment.status === 'Graded' && assignment.score !== null) {
      return (
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full">
            Проверено
          </span>
          <span className="px-2 py-1 text-xs font-bold bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300 rounded-full">
            {assignment.score} б.
          </span>
        </div>
      );
    }
    if (assignment.status === 'Submitted') {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
          На проверке
        </span>
      );
    }
    return null;
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-lg border-l-4 ${borderColors[statusColor]} ${bgColors[statusColor]} shadow-sm hover:shadow-md transition-all cursor-pointer p-4 space-y-3`}
    >
      {/* Description */}
      <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
        {assignment.description}
      </p>

      {/* Group/Subject */}
      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
        <AcademicCapIcon className="h-4 w-4" />
        <span className="truncate">{assignment.group.name}</span>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <CalendarIcon className="h-4 w-4" />
            <span>Выдано</span>
          </div>
          <div className="font-medium text-gray-900 dark:text-white">{formatDate(assignment.assignedDate)}</div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <ClockIcon className="h-4 w-4" />
            <span>Срок</span>
          </div>
          <div className="font-medium text-gray-900 dark:text-white">{formatDate(assignment.dueDate)}</div>
        </div>
      </div>

      {/* Status Badge */}
      {getStatusBadge() && (
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          {getStatusBadge()}
        </div>
      )}
    </div>
  );
}
