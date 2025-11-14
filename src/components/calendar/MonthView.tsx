'use client';

import { Lesson, getLessonsForDay, getCalendarGrid, generateSubjectColor, formatTime } from '@/types/Lesson';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

interface MonthViewProps {
  date: Date;
  lessons: Lesson[];
  onLessonClick: (lesson: Lesson) => void;
}

export default function MonthView({ date, lessons, onLessonClick }: MonthViewProps) {
  const calendarDays = getCalendarGrid(date);
  const currentMonth = date.getMonth();
  const today = new Date();

  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <div className="flex flex-col h-full">
      {/* Month header */}
      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10">
        <div className="grid grid-cols-7">
          {dayNames.map((dayName) => (
            <div
              key={dayName}
              className="p-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700 last:border-r-0"
            >
              {dayName}
            </div>
          ))}
        </div>
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-7" style={{ gridTemplateRows: 'repeat(6, minmax(140px, 1fr))' }}>
          {calendarDays.map((day) => {
            const dayLessons = getLessonsForDay(lessons, day);
            const isCurrentMonth = day.getMonth() === currentMonth;
            const isToday = day.toDateString() === today.toDateString();
            const isWeekend = day.getDay() === 0 || day.getDay() === 6;

            return (
              <div
                key={day.toISOString()}
                className={`border-r border-b border-gray-200 dark:border-gray-700 p-2 min-h-[140px] last:border-r-0 ${
                  isCurrentMonth 
                    ? 'bg-white dark:bg-gray-800' 
                    : 'bg-gray-50 dark:bg-gray-900'
                } ${isWeekend ? 'bg-gray-25 dark:bg-gray-850' : ''}`}
              >
                {/* Day number */}
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`text-sm font-medium ${
                      isToday
                        ? 'bg-violet-600 text-white rounded-full w-6 h-6 flex items-center justify-center'
                        : isCurrentMonth
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {day.getDate()}
                  </div>
                  
                  {dayLessons.length > 0 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {dayLessons.length}
                    </div>
                  )}
                </div>

                {/* Lessons */}
                <div className="space-y-1">
                  {dayLessons.slice(0, 3).map((lesson) => (
                    <MonthLessonBlock
                      key={lesson.id}
                      lesson={lesson}
                      onClick={() => onLessonClick(lesson)}
                    />
                  ))}
                  
                  {dayLessons.length > 3 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-1">
                      +{dayLessons.length - 3} еще
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

interface MonthLessonBlockProps {
  lesson: Lesson;
  onClick: () => void;
}

function MonthLessonBlock({ lesson, onClick }: MonthLessonBlockProps) {
  const subjectColor = generateSubjectColor(lesson.subject.subjectName);

  return (
    <div
      onClick={onClick}
      className="text-xs p-1 rounded cursor-pointer hover:shadow-sm transition-all truncate
                 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
      style={{ 
        borderLeft: `3px solid ${subjectColor}`,
        paddingLeft: '6px'
      }}
      title={`${lesson.subject.subjectName} - ${lesson.group.name} (${formatTime(lesson.startTime)}-${formatTime(lesson.endTime)})${lesson.note ? ' • Есть комментарий' : ''}`}
    >
      <div className="flex items-center gap-1 font-medium text-gray-900 dark:text-white">
        <span className="line-clamp-1 flex-1 min-w-0">
          {formatTime(lesson.startTime)} {lesson.subject.subjectName}
        </span>
        {lesson.note && (
          <ChatBubbleLeftIcon 
            className="w-3 h-3 text-blue-500 dark:text-blue-400 flex-shrink-0" 
          />
        )}
      </div>
    </div>
  );
}