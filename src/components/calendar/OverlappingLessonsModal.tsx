import { Lesson } from '@/types/Lesson';
import { ClockIcon, UserGroupIcon, AcademicCapIcon, MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface OverlappingLessonsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessons: Lesson[];
  timeSlot: string;
  onLessonClick?: (lesson: Lesson) => void;
}

export default function OverlappingLessonsModal({ 
  isOpen, 
  onClose, 
  lessons, 
  timeSlot,
  onLessonClick 
}: OverlappingLessonsModalProps) {
  if (!isOpen) return null;

  const getStatusColor = (status: Lesson['lessonStatus']) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'Cancelled':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'Moved':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      default: // Planned
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
    }
  };

  const getStatusText = (status: Lesson['lessonStatus']) => {
    switch (status) {
      case 'Completed':
        return 'Проведено';
      case 'Cancelled':
        return 'Отменено';
      case 'Moved':
        return 'Перенесено';
      default:
        return 'Запланировано';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Накладывающиеся занятия
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {timeSlot} • {lessons.length} {lessons.length === 1 ? 'занятие' : lessons.length < 5 ? 'занятия' : 'занятий'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-3">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              onClick={() => {
                if (onLessonClick) {
                  onLessonClick(lesson);
                  onClose();
                }
              }}
              className={`p-4 rounded-lg border border-gray-200 dark:border-gray-700 ${
                onLessonClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50' : ''
              } transition-colors`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {lesson.subject.subjectName}
                  </h4>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lesson.lessonStatus)}`}>
                    {getStatusText(lesson.lessonStatus)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <ClockIcon className="w-4 h-4" />
                  <span>{lesson.startTime.slice(0, 5)} - {lesson.endTime.slice(0, 5)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <UserGroupIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span>Группа: <strong>{lesson.group.name}</strong></span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <AcademicCapIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span>Преподаватель: <strong>{lesson.teacher.name}</strong></span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <MapPinIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span>Кабинет: <strong>{lesson.room.name}</strong></span>
                </div>

                {lesson.students.length > 0 && (
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Студенты: {lesson.students.length}
                    </p>
                  </div>
                )}

                {lesson.note && (
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Примечание: <span className="text-gray-800 dark:text-gray-200">{lesson.note}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
