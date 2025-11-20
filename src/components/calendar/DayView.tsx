'use client';

import { Lesson, getTimeSlots, getLessonsForDay, formatTime, generateSubjectColor, getLessonStatusColor } from '@/types/Lesson';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

interface DayViewProps {
  date: Date;
  lessons: Lesson[];
  onLessonClick: (lesson: Lesson) => void;
}

interface TimeSlot {
  lessons: Lesson[];
  startTime: string;
  endTime: string;
}

// Helper function to check if two time ranges overlap
function timeRangesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
  const toMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };
  
  const s1 = toMinutes(start1);
  const e1 = toMinutes(end1);
  const s2 = toMinutes(start2);
  const e2 = toMinutes(end2);
  
  return s1 < e2 && s2 < e1;
}

// Group overlapping lessons together
function groupOverlappingLessons(lessonsList: Lesson[]): TimeSlot[] {
  if (lessonsList.length === 0) return [];
  
  const sorted = [...lessonsList].sort((a, b) => {
    const timeA = a.startTime.localeCompare(b.startTime);
    if (timeA !== 0) return timeA;
    return a.endTime.localeCompare(b.endTime);
  });
  
  const groups: TimeSlot[] = [];
  const used = new Set<string>();
  
  for (let i = 0; i < sorted.length; i++) {
    if (used.has(sorted[i].id)) continue;
    
    const overlapping: Lesson[] = [sorted[i]];
    used.add(sorted[i].id);
    
    for (let j = i + 1; j < sorted.length; j++) {
      if (used.has(sorted[j].id)) continue;
      
      const hasOverlap = overlapping.some(lesson => 
        timeRangesOverlap(lesson.startTime, lesson.endTime, sorted[j].startTime, sorted[j].endTime)
      );
      
      if (hasOverlap) {
        overlapping.push(sorted[j]);
        used.add(sorted[j].id);
      }
    }
    
    // Находим минимальное время начала и максимальное время окончания
    const minStartTime = overlapping.reduce((min, l) => l.startTime < min ? l.startTime : min, overlapping[0].startTime);
    const maxEndTime = overlapping.reduce((max, l) => l.endTime > max ? l.endTime : max, overlapping[0].endTime);
    
    groups.push({
      lessons: overlapping,
      startTime: minStartTime,
      endTime: maxEndTime
    });
  }
  
  return groups;
}

export default function DayView({ date, lessons, onLessonClick }: DayViewProps) {
  const timeSlots = getTimeSlots(); // 08:00 - 23:00
  const dayLessons = getLessonsForDay(lessons, date);
  const timeSlotGroups = groupOverlappingLessons(dayLessons);

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
      height: Math.max(30, height) // Minimum 30px for very short lessons
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
              className="flex border-b border-gray-100 dark:border-gray-700 h-[60px]"
            >
              {/* Time label */}
              <div className="w-16 flex-shrink-0 flex items-center justify-end pr-3 text-sm font-medium text-gray-600 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600">
                {timeSlot}
              </div>

              {/* Empty lesson area */}
              <div className="flex-1 relative">
                {/* This space will be filled by absolutely positioned lessons */}
              </div>
            </div>
          ))}

          {/* Absolutely positioned lessons */}
          <div className="absolute inset-0 left-16 pointer-events-none">
            {timeSlotGroups.map((slot, idx) => {
              const hasOverlap = slot.lessons.length > 1;
              
              if (hasOverlap) {
                // Show overlapping lessons side by side
                // Find earliest start and latest end for the container
                const positions = slot.lessons.map(l => getLessonPosition(l));
                const minTop = Math.min(...positions.map(p => p.top));
                const maxBottom = Math.max(...positions.map(p => p.top + p.height));
                const containerHeight = maxBottom - minTop;
                
                return (
                  <div
                    key={`overlap-${idx}`}
                    className="absolute left-2 right-2 pointer-events-auto flex gap-2"
                    style={{
                      top: `${minTop}px`,
                      height: `${containerHeight}px`,
                      zIndex: 10
                    }}
                  >
                    {slot.lessons.map((lesson) => {
                      const lessonPos = getLessonPosition(lesson);
                      const offsetTop = lessonPos.top - minTop;
                      
                      return (
                        <div key={lesson.id} className="flex-1 relative" style={{ height: '100%' }}>
                          <div 
                            className="absolute left-0 right-0"
                            style={{
                              top: `${offsetTop}px`,
                              height: `${lessonPos.height}px`
                            }}
                          >
                            <LessonBlock
                              lesson={lesson}
                              onClick={() => onLessonClick(lesson)}
                              height={lessonPos.height}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              } else {
                const lesson = slot.lessons[0];
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
              }
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
  
  // Adaptive padding based on height
  const isShort = height && height < 50;
  const showTime = !height || height >= 50; // Show time only if block is tall enough
  const paddingClass = isShort ? 'p-1.5' : 'p-2.5';

  return (
    <div
      onClick={onClick}
      className={`${paddingClass} rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-all
                 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 overflow-hidden`}
      style={{ 
        borderLeftColor: subjectColor,
        height: height ? `${height}px` : 'auto',
        maxHeight: height ? `${height}px` : 'none',
        boxSizing: 'border-box'
      }}
      title={`${lesson.subject.subjectName} - ${lesson.group.name}\n${formatTime(lesson.startTime)} - ${formatTime(lesson.endTime)}\n${lesson.teacher.name} • ${lesson.room.name}`}
    >
      <div className="flex flex-col h-full justify-between">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <h4 className="font-medium text-gray-900 dark:text-white line-clamp-1" title={lesson.subject.subjectName}>
                {lesson.subject.subjectName}
              </h4>
              {lesson.note && (
                <ChatBubbleLeftIcon 
                  className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0" 
                  title="Есть комментарий преподавателя"
                />
              )}
            </div>
          </div>
          
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: statusColor }}
            title={lesson.lessonStatus}
          />
        </div>
        {showTime && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-auto">
            {formatTime(lesson.startTime)} - {formatTime(lesson.endTime)}
          </p>
        )}
      </div>
    </div>
  );
}