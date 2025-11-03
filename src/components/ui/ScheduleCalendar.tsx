import React, { useState, useMemo } from 'react';
import { Schedule, formatTimeRange } from '../../types/Schedule';
import { DaysOfWeekDisplay } from './DaysOfWeekDisplay';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface ScheduleCalendarProps {
  schedules: Schedule[];
  viewType: 'day' | 'week' | 'month';
  onEventClick?: (schedule: Schedule) => void;
}

export const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  schedules,
  viewType,
  onEventClick
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Helper functions
  const startOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
    return new Date(d.setDate(diff));
  };

  const startOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  const endOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  };

  const getDaysInRange = (start: Date, end: Date) => {
    const days = [];
    const current = new Date(start);
    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  const getSchedulesForDay = (dayOfWeek: number, targetDate: Date) => {
    return schedules.filter(schedule => {
      // Check if this day of week is in the schedule
      if (!schedule.daysOfWeek.includes(dayOfWeek)) return false;
      
      // Check if the schedule is active on this date
      const effectiveFrom = new Date(schedule.effectiveFrom);
      const effectiveTo = schedule.effectiveTo ? new Date(schedule.effectiveTo) : null;
      
      return targetDate >= effectiveFrom && (!effectiveTo || targetDate <= effectiveTo);
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (viewType) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setCurrentDate(newDate);
  };

  const renderDayView = () => {
    const dayOfWeek = currentDate.getDay() || 7; // Convert Sunday (0) to 7
    const daySchedules = getSchedulesForDay(dayOfWeek, currentDate);
    const hours = Array.from({ length: 16 }, (_, i) => i + 8); // 8:00 to 23:00

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {currentDate.toLocaleDateString('ru-RU', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          
          {daySchedules.length === 0 ? (
            <div className="grid gap-6" style={{ gridTemplateColumns: '70px 1fr' }}>
              {/* Time column */}
              <div className="space-y-1">
                {hours.map((hour) => (
                  <div key={hour} className="h-16 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {hour.toString().padStart(2, '0')}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        00
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Events column */}
              <div className="space-y-1">
                {hours.map((hour) => (
                  <div key={hour} className="h-16 border border-gray-200 dark:border-gray-600 rounded flex items-center justify-center bg-gray-50/50 dark:bg-gray-800/50">
                    <span className="text-gray-400 dark:text-gray-500 text-sm italic">Нет занятий</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid gap-6" style={{ gridTemplateColumns: '70px 1fr' }}>
              {/* Time column */}
              <div className="space-y-1">
                {hours.map((hour) => (
                  <div key={hour} className="h-16 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {hour.toString().padStart(2, '0')}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        00
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Events column */}
              <div className="space-y-1 relative">
                {/* Background time grid */}
                <div className="absolute inset-0">
                  {hours.map((hour, index) => (
                    <div 
                      key={hour} 
                      className="h-16 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                      style={{ marginBottom: '4px' }}
                    >
                      {/* Half-hour line */}
                      <div className="absolute left-0 right-0 h-px bg-gray-100 dark:bg-gray-800" style={{ top: '32px' }}></div>
                    </div>
                  ))}
                </div>
                
                {/* Render lessons as absolute positioned blocks */}
                {daySchedules.map((schedule, scheduleIndex) => {
                  const startHour = parseInt(schedule.startTime.split(':')[0]);
                  const startMinute = parseInt(schedule.startTime.split(':')[1]);
                  const endHour = parseInt(schedule.endTime.split(':')[0]);
                  const endMinute = parseInt(schedule.endTime.split(':')[1]);
                  
                  const startTime = startHour + (startMinute / 60);
                  const endTime = endHour + (endMinute / 60);
                  const duration = endTime - startTime;
                  const isShortLesson = duration < 1; // Урок меньше часа
                  
                  // Calculate position and height
                  const topOffset = (startTime - 8) * 68; // 64px height + 4px gap
                  const height = Math.max(80, duration * 68 - 4); // minimum 80px, subtract gap
                  
                  return (
                    <div
                      key={`${schedule.id}-${scheduleIndex}`}
                      className="absolute left-0 right-0 bg-gradient-to-r from-violet-100 to-violet-50 dark:from-violet-900/40 dark:to-violet-900/20 rounded-xl border-l-4 border-violet-500 shadow-md cursor-pointer hover:shadow-lg hover:from-violet-200 hover:to-violet-100 dark:hover:from-violet-900/60 dark:hover:to-violet-900/30 transition-all duration-200 overflow-hidden"
                      style={{
                        top: `${topOffset}px`,
                        height: `${height}px`,
                        zIndex: 10
                      }}
                      onClick={() => onEventClick?.(schedule)}
                    >
                      <div className="p-3 h-full flex flex-col overflow-hidden">
                        <div className="flex justify-between items-start mb-2 min-h-0">
                          <h4 className="font-semibold text-violet-900 dark:text-violet-200 text-sm leading-tight truncate flex-1 mr-2">
                            {schedule.subject.subjectName}
                          </h4>
                          <span className="text-xs font-medium text-violet-700 dark:text-violet-300 bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded-lg whitespace-nowrap">
                            {formatTimeRange(schedule.startTime, schedule.endTime)}
                          </span>
                        </div>
                        {!isShortLesson && (
                          <div className="flex-1 min-h-0 overflow-hidden">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 min-h-0">
                                <div className="w-1.5 h-1.5 bg-violet-500 rounded-full flex-shrink-0"></div>
                                <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
                                  <span className="font-medium">Группа:</span> {schedule.group.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 min-h-0">
                                <div className="w-1.5 h-1.5 bg-violet-500 rounded-full flex-shrink-0"></div>
                                <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
                                  <span className="font-medium">Преподаватель:</span> {schedule.teacher.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 min-h-0">
                                <div className="w-1.5 h-1.5 bg-violet-500 rounded-full flex-shrink-0"></div>
                                <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
                                  <span className="font-medium">Аудитория:</span> {schedule.room.name}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                        {isShortLesson && (
                          <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 truncate">
                            <span className="font-medium">{schedule.group.name}</span>
                            <span>•</span>
                            <span className="truncate">{schedule.room.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Функция для расчета высоты урока в пикселях
  const calculateLessonHeight = (schedule: Schedule): number => {
    const startHour = parseInt(schedule.startTime.split(':')[0]);
    const startMinute = parseInt(schedule.startTime.split(':')[1]);
    const endHour = parseInt(schedule.endTime.split(':')[0]);
    const endMinute = parseInt(schedule.endTime.split(':')[1]);
    
    const startTime = startHour + (startMinute / 60);
    const endTime = endHour + (endMinute / 60);
    const duration = endTime - startTime;
    
    // 68px высота одного часового слота (64px + 4px gap)
    // Минимум 80px для читаемости
    return Math.max(80, duration * 68);
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekDays = getDaysInRange(weekStart, new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000));
    const hours = Array.from({ length: 16 }, (_, i) => i + 8); // 8:00 to 23:00

    // Создаем сетку для размещения уроков
    const createTimeGrid = (day: Date, dayOfWeek: number) => {
      const daySchedules = getSchedulesForDay(dayOfWeek, day);
      const grid: Array<{ 
        hour: number; 
        schedule?: Schedule; 
        isStart?: boolean; 
        isMiddle?: boolean; 
        isEnd?: boolean 
      }> = [];
      
      hours.forEach(hour => {
        let cellData: { 
          hour: number; 
          schedule?: Schedule; 
          isStart?: boolean; 
          isMiddle?: boolean; 
          isEnd?: boolean 
        } = { hour };
        
        // Находим урок, который должен отображаться в этом часе
        const scheduleForHour = daySchedules.find(schedule => {
          const startHour = parseInt(schedule.startTime.split(':')[0]);
          const startMinute = parseInt(schedule.startTime.split(':')[1]);
          const endHour = parseInt(schedule.endTime.split(':')[0]);
          const endMinute = parseInt(schedule.endTime.split(':')[1]);
          
          const lessonStart = startHour + (startMinute / 60);
          const lessonEnd = endHour + (endMinute / 60);
          
          return lessonStart <= hour && hour < lessonEnd;
        });
        
        if (scheduleForHour) {
          const startHour = parseInt(scheduleForHour.startTime.split(':')[0]);
          const endHour = parseInt(scheduleForHour.endTime.split(':')[0]);
          const endMinute = parseInt(scheduleForHour.endTime.split(':')[1]);
          
          cellData = {
            hour,
            schedule: scheduleForHour,
            isStart: hour === startHour,
            isMiddle: hour > startHour && hour < endHour,
            isEnd: hour === endHour && endMinute === 0 // Урок заканчивается ровно в начале часа
          };
        }
        
        grid.push(cellData);
      });
      
      return grid;
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header with days */}
        <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-600">
          {/* Empty cell for time column */}
          <div className="border-r border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-3">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Время</span>
          </div>
          {weekDays.map((day, index) => {
            const isToday = day.toDateString() === new Date().toDateString();
            
            return (
              <div key={index} className="border-r border-gray-200 dark:border-gray-600 last:border-r-0">
                <div className={`p-3 text-center ${
                  isToday ? 'bg-violet-50 dark:bg-violet-900/20' : 'bg-gray-50 dark:bg-gray-700'
                }`}>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    {day.toLocaleDateString('ru-RU', { weekday: 'short' })}
                  </div>
                  <div className={`text-lg font-semibold ${
                    isToday ? 'text-violet-600 dark:text-violet-400' : 'text-gray-900 dark:text-white'
                  }`}>
                    {day.getDate()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div className="grid grid-cols-8">
          {hours.map((hour) => (
            <React.Fragment key={hour}>
              {/* Time column */}
              <div className="border-r border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 text-center">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {hour.toString().padStart(2, '0')}:00
                </span>
              </div>
              
              {/* Day columns */}
              {weekDays.map((day, dayIndex) => {
                const dayOfWeek = day.getDay() || 7;
                const timeGrid = createTimeGrid(day, dayOfWeek);
                const cellData = timeGrid.find(cell => cell.hour === hour);
                
                return (
                  <div 
                    key={`${dayIndex}-${hour}`} 
                    className="border-r border-b border-gray-200 dark:border-gray-600 last:border-r-0 p-1 min-h-[60px] relative"
                  >
                    {cellData?.schedule && cellData.isStart && cellData.schedule && (
                      <div 
                        className="absolute inset-1 bg-violet-100 dark:bg-violet-900/30 rounded text-xs cursor-pointer hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors border border-violet-300 dark:border-violet-600 p-2"
                        style={{
                          height: `${calculateLessonHeight(cellData.schedule) - 4}px`, // -4px для padding
                          zIndex: 10
                        }}
                        onClick={() => onEventClick?.(cellData.schedule!)}
                      >
                        <div className="font-medium text-violet-800 dark:text-violet-300 truncate mb-1">
                          {cellData.schedule.subject.subjectName}
                        </div>
                        <div className="text-violet-600 dark:text-violet-400 text-xs mb-1">
                          {formatTimeRange(cellData.schedule.startTime, cellData.schedule.endTime)}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400 truncate text-xs">
                          {cellData.schedule.group.name}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400 truncate text-xs">
                          {cellData.schedule.teacher.name}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = new Date(calendarStart);
    calendarEnd.setDate(calendarEnd.getDate() + 41); // 6 weeks

    const calendarDays = getDaysInRange(calendarStart, calendarEnd);

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-600">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
            <div key={day} className="p-3 text-center bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600 last:border-r-0">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{day}</span>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const dayOfWeek = day.getDay() || 7;
            const daySchedules = getSchedulesForDay(dayOfWeek, day);
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isToday = day.toDateString() === new Date().toDateString();
            
            return (
              <div 
                key={index} 
                className={`min-h-[120px] border-r border-b border-gray-200 dark:border-gray-600 last:border-r-0 p-2 ${
                  !isCurrentMonth ? 'bg-gray-50 dark:bg-gray-700/50' : ''
                }`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isToday 
                    ? 'text-violet-600 dark:text-violet-400' 
                    : isCurrentMonth 
                      ? 'text-gray-900 dark:text-white' 
                      : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {day.getDate()}
                </div>
                <div className="space-y-1">
                  {daySchedules.slice(0, 3).map((schedule, idx) => (
                    <div 
                      key={`${schedule.id}-${idx}`}
                      className="text-xs p-1 bg-violet-100 dark:bg-violet-900/30 rounded cursor-pointer hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors"
                      onClick={() => onEventClick?.(schedule)}
                    >
                      <div className="font-medium text-violet-800 dark:text-violet-300 truncate">
                        {schedule.subject.subjectName}
                      </div>
                    </div>
                  ))}
                  {daySchedules.length > 3 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      +{daySchedules.length - 3} еще
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getTitle = () => {
    switch (viewType) {
      case 'day':
        return currentDate.toLocaleDateString('ru-RU', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      case 'week':
        const weekStart = startOfWeek(currentDate);
        const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
        return `${weekStart.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} - ${weekEnd.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}`;
      case 'month':
        return currentDate.toLocaleDateString('ru-RU', { 
          year: 'numeric', 
          month: 'long' 
        });
      default:
        return '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {getTitle()}
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateDate('prev')}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Сегодня
          </button>
          <button
            onClick={() => navigateDate('next')}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Calendar Content */}
      {viewType === 'day' && renderDayView()}
      {viewType === 'week' && renderWeekView()}
      {viewType === 'month' && renderMonthView()}
    </div>
  );
};