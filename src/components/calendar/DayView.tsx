'use client';

import { Lesson, getTimeSlots, getLessonsForDay, formatTime, generateSubjectColor, getLessonStatusColor } from '@/types/Lesson';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

interface DayViewProps {
  date: Date;
  lessons: Lesson[];
  onLessonClick: (lesson: Lesson) => void;
}

export default function DayView({ date, lessons, onLessonClick }: DayViewProps) {
  const timeSlots = getTimeSlots(); // 08:00 - 23:00
  const dayLessons = getLessonsForDay(lessons, date);

  // Calculate lesson position and height
  const getLessonPosition = (lesson: Lesson) => {
    const [startHour, startMin] = lesson.startTime.split(':').map(Number);
    const [endHour, endMin] = lesson.endTime.split(':').map(Number);
    
    const startTotalMin = startHour * 60 + startMin;
    const endTotalMin = endHour * 60 + endMin;
    
    // First time slot is 08:00 (8 * 60 = 480 minutes from midnight)
    const firstSlotMin = 8 * 60;
    
    // Calculate position relative to the first time slot
    const topOffset = ((startTotalMin - firstSlotMin) / 60) * 60; // 60px per hour
    const height = ((endTotalMin - startTotalMin) / 60) * 60; // 60px per hour
    
    return {
      top: Math.max(0, topOffset), // Ensure non-negative
      height: Math.max(60, height) // Minimum 60px
    };
  };

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
          {/* Time slots grid */}
          {timeSlots.map((timeSlot) => (
            <div
              key={timeSlot}
              className="flex border-b border-gray-100 dark:border-gray-700 min-h-[60px]"
            >
              {/* Time label */}
              <div className="w-16 flex-shrink-0 p-2 text-sm text-gray-500 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">
                {timeSlot}
              </div>

              {/* Empty lesson area */}
              <div className="flex-1 p-2 relative">
                {/* This space will be filled by absolutely positioned lessons */}
              </div>
            </div>
          ))}

          {/* Absolutely positioned lessons */}
          <div className="absolute inset-0 left-16 pointer-events-none">
            {dayLessons.map((lesson) => {
              const position = getLessonPosition(lesson);
              
              return (
                <div
                  key={lesson.id}
                  className="absolute left-2 right-2 pointer-events-auto"
                  style={{
                    top: `${position.top}px`,
                    height: `${position.height}px`,
                    zIndex: 10
                  }}
                >
                  <LessonBlock
                    lesson={lesson}
                    onClick={() => onLessonClick(lesson)}
                    height={position.height}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

interface LessonBlockProps {
  lesson: Lesson;
  onClick: () => void;
  height?: number;
}

function LessonBlock({ lesson, onClick, height }: LessonBlockProps) {
  const subjectColor = generateSubjectColor(lesson.subject.subjectName);
  const statusColor = getLessonStatusColor(lesson.lessonStatus);

  return (
    <div
      onClick={onClick}
      className="p-3 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-all
                 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
      style={{ 
        borderLeftColor: subjectColor,
        height: height ? `${height}px` : 'auto',
        minHeight: '60px'
      }}
    >
      <div className="flex items-start justify-between h-full">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <h4 className="font-medium text-gray-900 dark:text-white truncate">
              {lesson.subject.subjectName}
            </h4>
            {lesson.note && (
              <ChatBubbleLeftIcon 
                className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0" 
                title="Есть комментарий преподавателя"
              />
            )}
          </div>
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