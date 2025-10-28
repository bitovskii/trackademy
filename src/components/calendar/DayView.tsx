'use client';

import { Lesson, getTimeSlots, isLessonInTimeSlot, getLessonsForDay, formatTime, generateSubjectColor, getLessonStatusColor } from '@/types/Lesson';

interface DayViewProps {
  date: Date;
  lessons: Lesson[];
  onLessonClick: (lesson: Lesson) => void;
}

export default function DayView({ date, lessons, onLessonClick }: DayViewProps) {
  const timeSlots = getTimeSlots(); // 08:00 - 23:00
  const dayLessons = getLessonsForDay(lessons, date);

  return (
    <div className="flex flex-col h-full">
      {/* Day header */}
      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 z-10">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {date.toLocaleDateString('ru-RU', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          })}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Занятий: {dayLessons.length}
        </p>
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="relative">
          {timeSlots.map((timeSlot, index) => {
            const nextTimeSlot = timeSlots[index + 1] || '24:00';
            const slotLessons = dayLessons.filter(lesson => 
              isLessonInTimeSlot(lesson, timeSlot)
            );

            return (
              <div
                key={timeSlot}
                className="flex border-b border-gray-100 dark:border-gray-700 min-h-[60px]"
              >
                {/* Time label */}
                <div className="w-16 flex-shrink-0 p-2 text-sm text-gray-500 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">
                  {timeSlot}
                </div>

                {/* Lesson slot */}
                <div className="flex-1 p-2 relative">
                  {slotLessons.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
                      {/* Empty slot */}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {slotLessons.map((lesson) => (
                        <LessonBlock
                          key={lesson.id}
                          lesson={lesson}
                          onClick={() => onLessonClick(lesson)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface LessonBlockProps {
  lesson: Lesson;
  onClick: () => void;
}

function LessonBlock({ lesson, onClick }: LessonBlockProps) {
  const subjectColor = generateSubjectColor(lesson.subject.subjectName);
  const statusColor = getLessonStatusColor(lesson.lessonStatus);

  return (
    <div
      onClick={onClick}
      className="p-3 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-all
                 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
      style={{ borderLeftColor: subjectColor }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 dark:text-white truncate">
            {lesson.subject.subjectName}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
            {lesson.group.name}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {formatTime(lesson.startTime)} - {formatTime(lesson.endTime)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {lesson.teacher.name} • {lesson.room.name}
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-1">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: statusColor }}
            title={lesson.lessonStatus}
          />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {lesson.students.length} студ.
          </span>
        </div>
      </div>
    </div>
  );
}