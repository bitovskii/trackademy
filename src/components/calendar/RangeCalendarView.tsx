'use client';

import { Lesson, getTimeSlots, getLessonsForDay, formatTime, generateSubjectColor, getLessonStatusColor } from '@/types/Lesson';

interface RangeCalendarViewProps {
  dateFrom: Date;
  dateTo: Date;
  lessons: Lesson[];
  onLessonClick: (lesson: Lesson) => void;
}

export default function RangeCalendarView({ dateFrom, dateTo, lessons, onLessonClick }: RangeCalendarViewProps) {
  const timeSlots = getTimeSlots(); // 08:00 - 23:00

  // Generate array of days in the range
  const getRangeDays = (from: Date, to: Date): Date[] => {
    const days: Date[] = [];
    const current = new Date(from);
    const end = new Date(to);
    
    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const rangeDays = getRangeDays(dateFrom, dateTo);

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
      top: Math.max(0, topOffset),
      height: Math.max(25, height) // Minimum 25px for very short lessons
    };
  };

  return (
    <div className="flex flex-col h-full">
      {/* Range header */}
      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10">
        <div className="flex">
          {/* Time column header */}
          <div className="w-16 flex-shrink-0 p-2 border-r border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">Время</div>
          </div>

          {/* Day headers - scroll horizontally if too many days */}
          <div className="flex flex-1 overflow-x-auto">
            {rangeDays.map((day) => {
              const dayLessons = getLessonsForDay(lessons, day);
              const isToday = day.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={day.toISOString()}
                  className="flex-shrink-0 w-32 p-2 border-r border-gray-200 dark:border-gray-700 last:border-r-0"
                >
                  <div className={`text-center ${isToday ? 'text-violet-600 dark:text-violet-400 font-semibold' : 'text-gray-900 dark:text-white'}`}>
                    <div className="text-sm font-medium">
                      {day.toLocaleDateString('ru-RU', { weekday: 'short' })}
                    </div>
                    <div className={`text-lg ${isToday ? 'bg-violet-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto' : ''}`}>
                      {day.getDate()}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {day.toLocaleDateString('ru-RU', { month: 'short' })}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {dayLessons.length} занятий
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-auto">
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
              <div className="flex flex-1">
                {rangeDays.map((day) => (
                  <div
                    key={`${day.toISOString()}-${timeSlot}`}
                    className="flex-shrink-0 w-32 p-1 border-r border-gray-100 dark:border-gray-700 last:border-r-0 relative"
                  >
                    {/* This space will be filled by absolutely positioned lessons */}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Absolutely positioned lessons for each day */}
          {rangeDays.map((day, dayIndex) => {
            const dayLessons = getLessonsForDay(lessons, day);
            
            return (
              <div
                key={`lessons-${day.toISOString()}`}
                className="absolute inset-0 pointer-events-none"
                style={{
                  left: `calc(4rem + ${dayIndex * 8}rem)`, // 4rem = w-16 for time column, 8rem = w-32 for each day
                  width: '8rem', // w-32
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
                      <RangeLessonBlock
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

interface RangeLessonBlockProps {
  lesson: Lesson;
  onClick: () => void;
  height?: number;
}

function RangeLessonBlock({ lesson, onClick, height }: RangeLessonBlockProps) {
  const subjectColor = generateSubjectColor(lesson.subject.subjectName);
  const statusColor = getLessonStatusColor(lesson.lessonStatus);
  
  // Adaptive padding based on height
  const isShort = height && height < 45;
  const showTime = !height || height >= 40; // Show time only if block is tall enough
  const paddingClass = isShort ? 'p-1' : 'p-1.5';

  return (
    <div
      onClick={onClick}
      className={`${paddingClass} rounded-lg border-l-4 cursor-pointer hover:shadow-sm transition-all
                 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-xs overflow-hidden`}
      style={{ 
        borderLeftColor: subjectColor,
        height: height ? `${height}px` : 'auto',
        maxHeight: height ? `${height}px` : 'none',
        boxSizing: 'border-box'
      }}
      title={`${lesson.subject.subjectName} - ${lesson.group.name}\n${formatTime(lesson.startTime)}-${formatTime(lesson.endTime)}`}
    >
      <div className="flex flex-col h-full justify-between">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 dark:text-white line-clamp-1 text-xs" title={lesson.subject.subjectName}>
              {lesson.subject.subjectName}
            </h4>
          </div>
          
          <div
            className="w-2 h-2 rounded-full flex-shrink-0 ml-1"
            style={{ backgroundColor: statusColor }}
            title={lesson.lessonStatus}
          />
        </div>
        {showTime && (
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-auto">
            {formatTime(lesson.startTime)}-{formatTime(lesson.endTime)}
          </p>
        )}
      </div>
    </div>
  );
}