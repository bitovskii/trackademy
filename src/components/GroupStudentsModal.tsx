'use client';

import React from 'react';
import { XMarkIcon, UserIcon } from '@heroicons/react/24/outline';
import { GroupStudent } from '../types/Group';

interface GroupStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupName: string;
  groupId: string;
  students: GroupStudent[];
  onStudentSelect: (studentId: string, studentName: string) => void;
  onFreezeStudent: (studentId: string, studentName: string) => void;
  onUnfreezeStudent: (studentId: string, studentName: string) => void;
}

export const GroupStudentsModal: React.FC<GroupStudentsModalProps> = ({
  isOpen,
  onClose,
  groupName,
  students,
  onStudentSelect,
  onFreezeStudent,
  onUnfreezeStudent
}) => {
  if (!isOpen) return null;

  const handleStudentClick = (student: GroupStudent) => {
    onStudentSelect(student.studentId, student.studentName);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Студенты группы
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {groupName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {students.length === 0 ? (
            <div className="text-center py-8">
              <UserIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Нет студентов
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                В этой группе пока нет студентов
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Выберите студента для создания платежа или управления заморозкой:
              </p>
              
              {students.map((student) => (
                <div
                  key={student.studentId}
                  className={`w-full p-4 rounded-lg border ${
                    student.isFrozen 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        student.isFrozen ? 'bg-blue-400' : 'bg-blue-500'
                      }`}>
                        <UserIcon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {student.studentName}
                        </p>
                        {student.isFrozen && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93M12 6l-3 6 3 6 3-6-3-6z"/>
                              <circle cx="12" cy="12" r="2"/>
                            </svg>
                            Заморожен
                          </span>
                        )}
                      </div>
                      {student.isFrozen && student.freezeStartDate && student.freezeEndDate && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {formatDate(student.freezeStartDate)} - {formatDate(student.freezeEndDate)}
                          {student.freezeReason && ` • ${student.freezeReason}`}
                        </p>
                      )}
                    </div>

                    <div className="flex-shrink-0 flex items-center gap-2">
                      <button
                        onClick={() => handleStudentClick(student)}
                        className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-lg transition-colors"
                        title="Создать платеж"
                      >
                        <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>

                      {student.isFrozen ? (
                        <button
                          onClick={() => onUnfreezeStudent(student.studentId, student.studentName)}
                          className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-lg transition-colors"
                          title="Разморозить"
                        >
                          <svg className="h-5 w-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </button>
                      ) : (
                        <button
                          onClick={() => onFreezeStudent(student.studentId, student.studentName)}
                          className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-lg transition-colors"
                          title="Заморозить"
                        >
                          <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93M12 6l-3 6 3 6 3-6-3-6z"/>
                            <circle cx="12" cy="12" r="2"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};