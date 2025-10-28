'use client';

import { Lesson, getTimeSlots, isLessonInTimeSlot, getLessonsForDay, getWeekDays, formatTime, generateSubjectColor, getLessonStatusColor, formatDateShort } from '@/types/Lesson';

interface WeekViewProps {
  date: Date;
  lessons: Lesson[];
  onLessonClick: (lesson: Lesson) => void;
}

export default function WeekView({ date, lessons, onLessonClick }: WeekViewProps) {
  const timeSlots = getTimeSlots(); // 08:00 - 23:00
  const weekDays = getWeekDays(date);

  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <div className="flex flex-col h-full">
      {/* Week header */}
      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10">
        <div className="flex">
          {/* Time column header */}
          <div className="w-16 flex-shrink-0 p-2 border-r border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">Время</div>
          </div>

          {/* Day headers */}
          {weekDays.map((day, index) => {
            const dayLessons = getLessonsForDay(lessons, day);
            const isToday = day.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={day.toISOString()}
                className="flex-1 p-2 border-r border-gray-200 dark:border-gray-700 last:border-r-0"
              >
                <div className={`text-center ${isToday ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-900 dark:text-white'}`}>
                  <div className="text-sm font-medium">{dayNames[index]}</div>
                  <div className={`text-lg ${isToday ? 'bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto' : ''}`}>
                    {day.getDate()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {dayLessons.length} занятий
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="relative">
          {timeSlots.map((timeSlot) => (
            <div
              key={timeSlot}
              className="flex border-b border-gray-100 dark:border-gray-700 min-h-[60px]"
            >
              {/* Time label */}
              <div className="w-16 flex-shrink-0 p-2 text-sm text-gray-500 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">
                {timeSlot}
              </div>

              {/* Day columns */}
              {weekDays.map((day) => {
                const dayLessons = getLessonsForDay(lessons, day);
                const slotLessons = dayLessons.filter(lesson => 
                  isLessonInTimeSlot(lesson, timeSlot)
                );

                return (
                  <div
                    key={`${day.toISOString()}-${timeSlot}`}
                    className="flex-1 p-1 border-r border-gray-100 dark:border-gray-700 last:border-r-0 relative"
                  >
                    {slotLessons.map((lesson) => (
                      <WeekLessonBlock
                        key={lesson.id}
                        lesson={lesson}
                        onClick={() => onLessonClick(lesson)}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface WeekLessonBlockProps {
  lesson: Lesson;
  onClick: () => void;
}

function WeekLessonBlock({ lesson, onClick }: WeekLessonBlockProps) {
  const subjectColor = generateSubjectColor(lesson.subject.subjectName);
  const statusColor = getLessonStatusColor(lesson.lessonStatus);

  return (
    <div
      onClick={onClick}
      className="mb-1 p-2 rounded text-xs cursor-pointer hover:shadow-sm transition-all
                 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
      style={{ borderLeftColor: subjectColor, borderLeftWidth: '3px' }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-gray-900 dark:text-white truncate flex-1">
          {lesson.subject.subjectName}
        </span>
        <div
          className="w-2 h-2 rounded-full ml-1"
          style={{ backgroundColor: statusColor }}
        />
      </div>
      
      <div className="text-gray-600 dark:text-gray-300 truncate mb-1">
        {lesson.group.name}
      </div>
      
      <div className="text-gray-500 dark:text-gray-400">
        {formatTime(lesson.startTime)}-{formatTime(lesson.endTime)}
      </div>
      
      <div className="text-gray-500 dark:text-gray-400 truncate">
        {lesson.room.name}
      </div>
    </div>
  );
}