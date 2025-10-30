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
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              На этот день нет запланированных занятий
            </p>
          ) : (
            <div className="space-y-3">
              {daySchedules
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((schedule, index) => (
                  <div 
                    key={`${schedule.id}-${index}`}
                    className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    onClick={() => onEventClick?.(schedule)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {schedule.subject.subjectName}
                      </h4>
                      <span className="text-sm font-medium text-violet-600 dark:text-violet-400">
                        {formatTimeRange(schedule.startTime, schedule.endTime)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <div>Группа: {schedule.group.name}</div>
                      <div>Преподаватель: {schedule.teacher.name}</div>
                      <div>Аудитория: {schedule.room.name}</div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekDays = getDaysInRange(weekStart, new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000));

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-600">
          {weekDays.map((day, index) => {
            const dayOfWeek = day.getDay() || 7;
            const daySchedules = getSchedulesForDay(dayOfWeek, day);
            const isToday = day.toDateString() === new Date().toDateString();
            
            return (
              <div key={index} className="border-r border-gray-200 dark:border-gray-600 last:border-r-0">
                <div className={`p-3 text-center border-b border-gray-200 dark:border-gray-600 ${
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
                <div className="p-2 min-h-[200px]">
                  {daySchedules
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((schedule, idx) => (
                      <div 
                        key={`${schedule.id}-${idx}`}
                        className="mb-2 p-2 bg-violet-100 dark:bg-violet-900/30 rounded text-xs cursor-pointer hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors"
                        onClick={() => onEventClick?.(schedule)}
                      >
                        <div className="font-medium text-violet-800 dark:text-violet-300 truncate">
                          {schedule.subject.subjectName}
                        </div>
                        <div className="text-violet-600 dark:text-violet-400">
                          {formatTimeRange(schedule.startTime, schedule.endTime)}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400 truncate">
                          {schedule.group.name}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
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