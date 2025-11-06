'use client';

import React from 'react';
import { XMarkIcon, UserIcon } from '@heroicons/react/24/outline';
import { GroupStudent } from '../types/Group';

interface GroupStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupName: string;
  students: GroupStudent[];
  onStudentSelect: (studentId: string, studentName: string) => void;
}

export const GroupStudentsModal: React.FC<GroupStudentsModalProps> = ({
  isOpen,
  onClose,
  groupName,
  students,
  onStudentSelect
}) => {
  if (!isOpen) return null;

  const handleStudentClick = (student: GroupStudent) => {
    onStudentSelect(student.studentId, student.studentName);
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
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
        <div className="p-6">
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
                Выберите студента для создания платежа:
              </p>
              
              {students.map((student) => (
                <button
                  key={student.studentId}
                  onClick={() => handleStudentClick(student)}
                  className="w-full flex items-center p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors text-left"
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {student.studentName}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};