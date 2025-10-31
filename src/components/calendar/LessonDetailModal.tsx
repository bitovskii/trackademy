'use client';

import { Lesson, formatDate, formatTimeRange, getLessonStatusText, getLessonStatusColor, generateSubjectColor } from '@/types/Lesson';
import { getAttendanceStatusText, getAttendanceStatusColor } from '@/types/Attendance';
import { useState } from 'react';
import QuickAttendance from '@/components/attendance/QuickAttendance';
import ImprovedAttendance from '@/components/attendance/ImprovedAttendance';

interface LessonDetailModalProps {
  lesson: Lesson;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export default function LessonDetailModal({ lesson, isOpen, onClose, onUpdate }: LessonDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'attendance' | 'quick-attendance'>('details');

  if (!isOpen) return null;

  const subjectColor = generateSubjectColor(lesson.subject.subjectName);
  const statusColor = getLessonStatusColor(lesson.lessonStatus);
  
  const attendedStudents = lesson.students.filter(s => s.attendanceStatus === 1);
  const absentStudents = lesson.students.filter(s => s.attendanceStatus === 2);
  const unmarkedStudents = lesson.students.filter(s => s.attendanceStatus === null);

  return (
    <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {lesson.subject.subjectName}
              </h2>
              <div
                className="px-3 py-1 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: statusColor }}
              >
                {getLessonStatusText(lesson.lessonStatus)}
              </div>
            </div>
            
            <div className="text-gray-600 dark:text-gray-300 space-y-1">
              <p><strong>Дата:</strong> {formatDate(lesson.date)}</p>
              <p><strong>Время:</strong> {formatTimeRange(lesson.startTime, lesson.endTime)}</p>
              <p><strong>Группа:</strong> {lesson.group.name}</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'details'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Детали
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'attendance'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Посещаемость ({lesson.students.length})
          </button>
          <button
            onClick={() => setActiveTab('quick-attendance')}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'quick-attendance'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Отметить посещаемость
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'details' && (
            <DetailsTab lesson={lesson} subjectColor={subjectColor} />
          )}
          
          {activeTab === 'attendance' && (
            <AttendanceTab
              students={lesson.students}
              attendedStudents={attendedStudents}
              absentStudents={absentStudents}
              unmarkedStudents={unmarkedStudents}
              lessonStatus={lesson.lessonStatus}
            />
          )}
          
          {activeTab === 'quick-attendance' && (
            <ImprovedAttendance 
              lesson={lesson} 
              onUpdate={onUpdate || (() => {})} 
              onClose={onClose}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}

interface DetailsTabProps {
  lesson: Lesson;
  subjectColor: string;
}

function DetailsTab({ lesson, subjectColor }: DetailsTabProps) {
  return (
    <div className="space-y-6">
      {/* Main Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Основная информация
          </h3>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Предмет</label>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: subjectColor }}
                />
                <span className="text-gray-900 dark:text-white font-medium">
                  {lesson.subject.subjectName}
                </span>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Группа</label>
              <p className="text-gray-900 dark:text-white font-medium mt-1">
                {lesson.group.name}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Преподаватель</label>
              <p className="text-gray-900 dark:text-white font-medium mt-1">
                {lesson.teacher.name}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Аудитория</label>
              <p className="text-gray-900 dark:text-white font-medium mt-1">
                {lesson.room.name}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Расписание
          </h3>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Дата</label>
              <p className="text-gray-900 dark:text-white font-medium mt-1">
                {formatDate(lesson.date)}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Время</label>
              <p className="text-gray-900 dark:text-white font-medium mt-1">
                {formatTimeRange(lesson.startTime, lesson.endTime)}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Статус</label>
              <div className="mt-1">
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: getLessonStatusColor(lesson.lessonStatus) }}
                >
                  {getLessonStatusText(lesson.lessonStatus)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes and Additional Info */}
      {(lesson.note || lesson.cancelReason) && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Дополнительная информация
          </h3>
          
          {lesson.note && (
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Примечание</label>
              <p className="text-gray-900 dark:text-white mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                {lesson.note}
              </p>
            </div>
          )}
          
          {lesson.cancelReason && (
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Причина отмены</label>
              <p className="text-red-600 dark:text-red-400 mt-1 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                {lesson.cancelReason}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface AttendanceTabProps {
  students: Lesson['students'];
  attendedStudents: Lesson['students'];
  absentStudents: Lesson['students'];
  unmarkedStudents: Lesson['students'];
  lessonStatus: Lesson['lessonStatus'];
}

function AttendanceTab({ students, attendedStudents, absentStudents, unmarkedStudents, lessonStatus }: AttendanceTabProps) {
  if (lessonStatus === 'Planned') {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">
          📅
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Занятие ещё не проведено
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Посещаемость будет доступна после проведения занятия
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {students.length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Всего студентов
          </div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {attendedStudents.length}
          </div>
          <div className="text-sm text-green-600 dark:text-green-400">
            Присутствовали
          </div>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {absentStudents.length}
          </div>
          <div className="text-sm text-red-600 dark:text-red-400">
            Отсутствовали
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
            {unmarkedStudents.length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Не отмечены
          </div>
        </div>
      </div>

      {/* Student List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Список студентов
        </h3>
        
        <div className="space-y-2">
          {students.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                {student.photoPath ? (
                  <img
                    src={student.photoPath}
                    alt={student.fullName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                    <span className="text-gray-600 dark:text-gray-300 font-medium">
                      {student.fullName.charAt(0)}
                    </span>
                  </div>
                )}
                
                <span className="font-medium text-gray-900 dark:text-white">
                  {student.fullName}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: getAttendanceStatusColor(student.attendanceStatus) + '20',
                    color: getAttendanceStatusColor(student.attendanceStatus),
                  }}
                >
                  {getAttendanceStatusText(student.attendanceStatus)}
                </span>
                
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getAttendanceStatusColor(student.attendanceStatus) }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}