'use client';

import { Lesson, getTimeSlots, getLessonsForDay, getWeekDays, formatTime, generateSubjectColor, getLessonStatusColor, formatDateShort } from '@/types/Lesson';

interface WeekViewProps {
  date: Date;
  lessons: Lesson[];
  onLessonClick: (lesson: Lesson) => void;
}

export default function WeekView({ date, lessons, onLessonClick }: WeekViewProps) {
  const timeSlots = getTimeSlots(); // 08:00 - 23:00
  const weekDays = getWeekDays(date);

  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

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
      height: Math.max(58, height) // Minimum 58px
    };
  };

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
                <div className={`text-center ${isToday ? 'text-violet-600 dark:text-violet-400 font-semibold' : 'text-gray-900 dark:text-white'}`}>
                  <div className="text-sm font-medium">{dayNames[index]}</div>
                  <div className={`text-lg ${isToday ? 'bg-violet-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto' : ''}`}>
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

              {/* Day columns */}
              {weekDays.map((day) => (
                <div
                  key={`${day.toISOString()}-${timeSlot}`}
                  className="flex-1 p-1 border-r border-gray-100 dark:border-gray-700 last:border-r-0 relative"
                >
                  {/* This space will be filled by absolutely positioned lessons */}
                </div>
              ))}
            </div>
          ))}

          {/* Absolutely positioned lessons for each day */}
          {weekDays.map((day, dayIndex) => {
            const dayLessons = getLessonsForDay(lessons, day);
            
            return (
              <div
                key={`lessons-${day.toISOString()}`}
                className="absolute inset-0 pointer-events-none"
                style={{
                  left: `calc(4rem + ${dayIndex} * (100% - 4rem) / 7)`, // 4rem = w-16 for time column
                  width: `calc((100% - 4rem) / 7 - 2px)`, // Equal width minus borders
                  height: '100%',
                  zIndex: 10
                }}
              >
                {dayLessons.map((lesson) => {
                  const position = getLessonPosition(lesson);
                  
                  return (
                    <div
                      key={lesson.id}
                      className="absolute left-1 right-1 pointer-events-auto"
                      style={{
                        top: `${position.top}px`,
                        height: `${position.height}px`
                      }}
                    >
                      <WeekLessonBlock
                        lesson={lesson}
                        onClick={() => onLessonClick(lesson)}
                        height={position.height}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface WeekLessonBlockProps {
  lesson: Lesson;
  onClick: () => void;
  height?: number;
}

function WeekLessonBlock({ lesson, onClick, height }: WeekLessonBlockProps) {
  const subjectColor = generateSubjectColor(lesson.subject.subjectName);
  const statusColor = getLessonStatusColor(lesson.lessonStatus);

  return (
    <div
      onClick={onClick}
      className="w-full p-2 rounded text-xs cursor-pointer hover:shadow-sm transition-all
                 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 overflow-hidden"
      style={{ 
        borderLeftColor: subjectColor, 
        borderLeftWidth: '3px',
        height: height ? `${height}px` : 'auto',
        minHeight: '58px'
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-gray-900 dark:text-white truncate flex-1">
          {lesson.subject.subjectName}
        </span>
        <div
          className="w-2 h-2 rounded-full ml-1 flex-shrink-0"
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