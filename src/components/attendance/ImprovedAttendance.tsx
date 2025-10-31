'use client';

import React, { useState, useMemo } from 'react';
import { Lesson } from '@/types/Lesson';
import { AttendanceStatus, getAttendanceStatusText, getAttendanceStatusColor, getAttendanceStatusIcon } from '@/types/Attendance';
import { attendanceApi } from '@/services/AttendanceApiService';

interface ImprovedAttendanceProps {
  lesson: Lesson;
  onUpdate: () => void;
  onClose?: () => void;
}

export default function ImprovedAttendance({ lesson, onUpdate, onClose }: ImprovedAttendanceProps) {
  const [loading, setLoading] = useState(false);
  // Хранилище статусов для каждого студента: studentId -> status
  const [studentStatuses, setStudentStatuses] = useState<Record<string, AttendanceStatus>>({});
  // Показать/скрыть быстрые действия
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Статусы для кнопок
  const availableStatuses: AttendanceStatus[] = [1, 2, 3, 4];

  // Выбранный статус для применения
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus | null>(null);

  // Получаем текущую статистику
  const getAttendanceStats = useMemo(() => {
    const stats = { attended: 0, absent: 0, late: 0, specialReason: 0, unmarked: 0 };
    
    lesson.students.forEach(student => {
      // Используем новый статус если есть, иначе текущий
      const currentStatus = studentStatuses[student.id] ?? student.attendanceStatus;
      
      switch (currentStatus) {
        case 1:
          stats.attended++;
          break;
        case 2:
          stats.absent++;
          break;
        case 3:
          stats.late++;
          break;
        case 4:
          stats.specialReason++;
          break;
        default:
          stats.unmarked++;
      }
    });

    return stats;
  }, [lesson.students, studentStatuses]);

  // Обработчик выбора статуса для студента
  const handleStudentStatusChange = (studentId: string, status: AttendanceStatus) => {
    setStudentStatuses(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  // Применение выбранного статуса ко всем студентам справа
  const handleApplyStatusToStudents = () => {
    if (!selectedStatus) return;

    const updatedStatuses = { ...studentStatuses };
    lesson.students.forEach(student => {
      updatedStatuses[student.id] = selectedStatus;
    });
    setStudentStatuses(updatedStatuses);
  };

  // Сброс всех изменений
  const handleReset = () => {
    setStudentStatuses({});
    setSelectedStatus(null);
  };

  // Отправка данных на сервер
  const handleSaveAttendance = async () => {
    const changedStudents = Object.entries(studentStatuses).filter(([studentId, newStatus]) => {
      const student = lesson.students.find(s => s.id === studentId);
      return student && student.attendanceStatus !== newStatus;
    });

    if (changedStudents.length === 0) {
      return;
    }

    setLoading(true);
    try {
      const attendances = changedStudents.map(([studentId, status]) => ({
        studentId,
        status
      }));

      await attendanceApi.markBulkAttendance({
        lessonId: lesson.id,
        attendances
      });

      setStudentStatuses({});
      onUpdate();
      
      // Закрываем модалку после успешного сохранения
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Ошибка при обновлении посещаемости:', error);
      
      // Более информативное сообщение об ошибке
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      
      if (errorMessage.includes('аутентификации') || errorMessage.includes('401') || errorMessage.includes('403')) {
        alert('Ошибка аутентификации. Пожалуйста, перезайдите в систему.');
      } else {
        alert(`Ошибка при обновлении посещаемости: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
          <div className="text-lg font-bold text-green-600 dark:text-green-400">
            {getAttendanceStats.attended}
          </div>
          <div className="text-xs text-green-600 dark:text-green-400">
            Присутствуют
          </div>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-center">
          <div className="text-lg font-bold text-red-600 dark:text-red-400">
            {getAttendanceStats.absent}
          </div>
          <div className="text-xs text-red-600 dark:text-red-400">
            Отсутствуют
          </div>
        </div>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-center">
          <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
            {getAttendanceStats.late}
          </div>
          <div className="text-xs text-yellow-600 dark:text-yellow-400">
            Опоздали
          </div>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg text-center">
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {getAttendanceStats.specialReason}
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-400">
            Уваж. причина
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center">
          <div className="text-lg font-bold text-gray-600 dark:text-gray-400">
            {getAttendanceStats.unmarked}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Не отмечены
          </div>
        </div>
      </div>

      {/* Быстрые действия - компактная панель */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
        <button
          onClick={() => setShowQuickActions(!showQuickActions)}
          className="w-full flex items-center justify-between p-4 text-left font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
        >
          <span>Быстрые действия</span>
          <div className="flex items-center gap-2">
            {Object.keys(studentStatuses).length > 0 && (
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs">
                {Object.keys(studentStatuses).length} изменений
              </span>
            )}
            <svg
              className={`w-5 h-5 transition-transform ${showQuickActions ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {showQuickActions && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-600 space-y-4">
            {/* Выбор статуса для массового применения */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Выберите статус для всех студентов:
              </h4>
              
              <div className="grid grid-cols-2 gap-2">
                {availableStatuses.map(status => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-sm font-medium transition-all ${
                      selectedStatus === status
                        ? 'text-white shadow-md transform scale-105'
                        : 'border border-gray-300 dark:border-gray-600 hover:shadow-md'
                    }`}
                    style={{
                      backgroundColor: selectedStatus === status ? getAttendanceStatusColor(status) : 'transparent',
                      borderColor: getAttendanceStatusColor(status),
                      color: selectedStatus === status ? 'white' : getAttendanceStatusColor(status)
                    }}
                  >
                    <span>{getAttendanceStatusIcon(status)}</span>
                    <span className="text-xs truncate">{getAttendanceStatusText(status)}</span>
                  </button>
                ))}
              </div>
              
              <button
                onClick={handleApplyStatusToStudents}
                disabled={!selectedStatus}
                className="w-full mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed text-sm"
              >
                Применить ко всем
              </button>
            </div>

            {/* Дублированные кнопки управления для удобства */}
            {Object.keys(studentStatuses).length > 0 && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Или используйте кнопки выше в заголовке списка
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveAttendance}
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed text-sm"
                    >
                      {loading ? 'Сохранение...' : `Отметить (${Object.keys(studentStatuses).length})`}
                    </button>
                    
                    <button
                      onClick={handleReset}
                      disabled={loading}
                      className="px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed text-sm"
                    >
                      Сбросить
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Список студентов */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Список студентов ({lesson.students.length})
          </h3>
          
          {/* Кнопки управления - всегда видны когда есть изменения */}
          {Object.keys(studentStatuses).length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={handleSaveAttendance}
                disabled={loading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed text-sm"
              >
                {loading ? 'Сохранение...' : `Отметить (${Object.keys(studentStatuses).length})`}
              </button>
              
              <button
                onClick={handleReset}
                disabled={loading}
                className="px-3 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed text-sm"
              >
                Сбросить
              </button>
            </div>
          )}
        </div>
          
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {lesson.students.map(student => {
              const currentStatus = studentStatuses[student.id] ?? student.attendanceStatus;
              const hasChanges = studentStatuses[student.id] !== undefined && studentStatuses[student.id] !== student.attendanceStatus;
              
              return (
                <div
                  key={student.id}
                  className={`p-3 rounded-lg border transition-all ${
                    hasChanges
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {student.fullName}
                      </div>
                      {hasChanges && (
                        <div className="text-xs text-blue-600 dark:text-blue-400">
                          Изменено
                        </div>
                      )}
                    </div>
                    
                    {/* Кнопки статусов для каждого студента */}
                    <div className="flex gap-1">
                      {availableStatuses.map(status => (
                        <button
                          key={status}
                          onClick={() => handleStudentStatusChange(student.id, status)}
                          className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
                            currentStatus === status
                              ? 'text-white shadow-md transform scale-110'
                              : 'text-gray-400 border border-gray-300 hover:text-white hover:shadow-md'
                          }`}
                          style={{
                            backgroundColor: currentStatus === status ? getAttendanceStatusColor(status) : 'transparent',
                            borderColor: getAttendanceStatusColor(status)
                          }}
                          title={getAttendanceStatusText(status)}
                        >
                          {getAttendanceStatusIcon(status)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
      </div>
    </div>
  );
}