import React, { useState, useMemo } from 'react';
import { Schedule, formatTimeRange } from '../../types/Schedule';
import { DaysOfWeekDisplay } from './DaysOfWeekDisplay';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { OverlappingSchedulesModal } from './OverlappingSchedulesModal';

interface ScheduleCalendarProps {
  schedules: Schedule[];
  viewType: 'day' | 'week' | 'month';
  onEventClick?: (schedule: Schedule) => void;
}

interface TimeSlot {
  start: number;
  end: number;
  schedules: Schedule[];
  startTime: string; // min start time from all schedules
  endTime: string;   // max end time from all schedules
}

export const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  schedules,
  viewType,
  onEventClick
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [overlappingModal, setOverlappingModal] = useState<{
    isOpen: boolean;
    schedules: Schedule[];
    timeSlot: string;
  }>({
    isOpen: false,
    schedules: [],
    timeSlot: ''
  });

  // Helper function to check if two time ranges overlap
  const timeRangesOverlap = (start1: string, end1: string, start2: string, end2: string): boolean => {
    const [h1, m1] = start1.split(':').map(Number);
    const [h2, m2] = end1.split(':').map(Number);
    const [h3, m3] = start2.split(':').map(Number);
    const [h4, m4] = end2.split(':').map(Number);
    
    const start1Time = h1 * 60 + m1;
    const end1Time = h2 * 60 + m2;
    const start2Time = h3 * 60 + m3;
    const end2Time = h4 * 60 + m4;
    
    return start1Time < end2Time && start2Time < end1Time;
  };

  // Group overlapping schedules into time slots
  const groupOverlappingSchedules = (schedulesList: Schedule[]): TimeSlot[] => {
    if (schedulesList.length === 0) return [];
    
    const timeSlots: TimeSlot[] = [];
    const processed = new Set<string>();
    
    schedulesList.forEach((schedule) => {
      if (processed.has(schedule.id)) return;
      
      const [startH, startM] = schedule.startTime.split(':').map(Number);
      const [endH, endM] = schedule.endTime.split(':').map(Number);
      const start = startH + startM / 60;
      const end = endH + endM / 60;
      
      // Find all schedules that overlap with this one
      const overlapping = schedulesList.filter((other) => 
        timeRangesOverlap(schedule.startTime, schedule.endTime, other.startTime, other.endTime)
      );
      
      // Mark all as processed
      overlapping.forEach(s => processed.add(s.id));
      
      // Calculate min start and max end times
      const minStartTime = overlapping.reduce((min, s) => s.startTime < min ? s.startTime : min, overlapping[0].startTime);
      const maxEndTime = overlapping.reduce((max, s) => s.endTime > max ? s.endTime : max, overlapping[0].endTime);
      
      timeSlots.push({
        start,
        end,
        schedules: overlapping,
        startTime: minStartTime,
        endTime: maxEndTime
      });
    });
    
    return timeSlots;
  };

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
    const timeSlots = groupOverlappingSchedules(daySchedules);
    const hours = Array.from({ length: 16 }, (_, i) => i + 8); // 8:00 to 23:00

    // Calculate schedule position and height
    const getSchedulePosition = (schedule: Schedule) => {
      const [startHour, startMin] = schedule.startTime.split(':').map(Number);
      const [endHour, endMin] = schedule.endTime.split(':').map(Number);
      
      const startTotalMin = startHour * 60 + startMin;
      const endTotalMin = endHour * 60 + endMin;
      
      // First time slot is 08:00 (8 * 60 = 480 minutes from midnight)
      const firstSlotMin = 8 * 60;
      
      // Calculate position relative to the first time slot (60px per hour)
      const topOffset = ((startTotalMin - firstSlotMin) / 60) * 60;
      const height = ((endTotalMin - startTotalMin) / 60) * 60;
      
      return {
        top: Math.max(0, topOffset),
        height: Math.max(30, height)
      };
    };

    // Calculate position for time slot (used for overlapping schedules block)
    const getTimeSlotPosition = (startTime: string, endTime: string) => {
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      
      const startTotalMin = startHour * 60 + startMin;
      const endTotalMin = endHour * 60 + endMin;
      
      // First time slot is 08:00 (8 * 60 = 480 minutes from midnight)
      const firstSlotMin = 8 * 60;
      
      // Calculate position relative to the first time slot (60px per hour)
      const topOffset = ((startTotalMin - firstSlotMin) / 60) * 60;
      const height = ((endTotalMin - startTotalMin) / 60) * 60;
      
      return {
        top: Math.max(0, topOffset),
        height: Math.max(30, height)
      };
    };

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
            <div className="flex-1 overflow-y-auto">
              <div className="relative">
                {/* Time slots grid */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="flex border-b border-gray-100 dark:border-gray-700 h-[60px]"
                  >
                    {/* Time label */}
                    <div className="w-16 flex-shrink-0 flex items-center justify-end pr-3 text-sm text-gray-500 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">
                      {hour.toString().padStart(2, '0')}:00
                    </div>

                    {/* Empty schedule area */}
                    <div className="flex-1 relative">
                      {/* This space will be filled by absolutely positioned schedules */}
                    </div>
                  </div>
                ))}
                
                {/* Absolutely positioned schedules */}
                <div className="absolute inset-0 left-16 pointer-events-none">
                  {timeSlots.map((slot, slotIndex) => {
                    const hasOverlap = slot.schedules.length > 1;
                    // Use slot's min/max times for overlapping schedules block
                    const position = hasOverlap 
                      ? getTimeSlotPosition(slot.startTime, slot.endTime)
                      : getSchedulePosition(slot.schedules[0]);
                    
                    if (hasOverlap) {
                      // Show overlapping schedules side by side
                      return (
                        <div
                          key={`slot-${slotIndex}`}
                          className="absolute left-2 right-2 pointer-events-auto flex gap-2"
                          style={{
                            top: `${position.top}px`,
                            height: `${position.height}px`,
                            zIndex: 10
                          }}
                        >
                          {slot.schedules.map((schedule) => {
                            const isShortSchedule = position.height < 60;
                            
                            return (
                              <div
                                key={schedule.id}
                                className="flex-1 bg-white dark:bg-gray-700 rounded-lg border-l-4 border-violet-500 shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 overflow-hidden"
                                onClick={() => onEventClick?.(schedule)}
                              >
                                <div className="p-1 h-full flex flex-col justify-center overflow-hidden relative group">
                                  {/* Tooltip при наведении */}
                                  <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-50 bg-gray-900 text-white text-xs rounded p-2 shadow-lg min-w-[200px]">
                                    <div className="font-semibold mb-1">{schedule.subject.subjectName}</div>
                                    <div>Группа: {schedule.group.name}</div>
                                    <div>Время: {formatTimeRange(schedule.startTime, schedule.endTime)}</div>
                                    <div>Кабинет: {schedule.room.name}</div>
                                    <div>Преподаватель: {schedule.teacher.name}</div>
                                  </div>

                                  {!isShortSchedule && (
                                    <>
                                      <h4 className="font-medium text-gray-900 dark:text-white text-xs truncate mb-0.5">
                                        {schedule.subject.subjectName}
                                      </h4>
                                      <div className="text-[10px] text-gray-500 dark:text-gray-400">
                                        {formatTimeRange(schedule.startTime, schedule.endTime)}
                                      </div>
                                    </>
                                  )}
                                  {isShortSchedule && (
                                    <h4 className="font-medium text-gray-900 dark:text-white text-[10px] truncate">
                                      {schedule.subject.subjectName}
                                    </h4>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    } else {
                      // Show single schedule
                      const schedule = slot.schedules[0];
                      const isShortSchedule = position.height < 60;
                      
                      return (
                        <div
                          key={schedule.id}
                          className="absolute left-2 right-2 pointer-events-auto bg-white dark:bg-gray-700 rounded-lg border-l-4 border-violet-500 shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 overflow-hidden relative group"
                          style={{
                            top: `${position.top}px`,
                            height: `${position.height}px`,
                            zIndex: 10
                          }}
                          onClick={() => onEventClick?.(schedule)}
                          title={`${schedule.subject.subjectName}\n${schedule.group.name}\n${formatTimeRange(schedule.startTime, schedule.endTime)}\n${schedule.room.name}\n${schedule.teacher.name}`}
                        >
                          {/* Tooltip при наведении */}
                          <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-50 bg-gray-900 text-white text-xs rounded p-2 shadow-lg min-w-[200px]">
                            <div className="font-semibold mb-1">{schedule.subject.subjectName}</div>
                            <div>Группа: {schedule.group.name}</div>
                            <div>Время: {formatTimeRange(schedule.startTime, schedule.endTime)}</div>
                            <div>Кабинет: {schedule.room.name}</div>
                            <div>Преподаватель: {schedule.teacher.name}</div>
                          </div>

                          <div className="p-1 h-full flex flex-col justify-center overflow-hidden">
                            {position.height >= 60 && (
                              <>
                                <h4 className="font-medium text-gray-900 dark:text-white text-xs truncate mb-0.5">
                                  {schedule.subject.subjectName}
                                </h4>
                                <div className="text-[10px] text-gray-500 dark:text-gray-400">
                                  {formatTimeRange(schedule.startTime, schedule.endTime)}
                                </div>
                              </>
                            )}
                            {position.height >= 35 && position.height < 60 && (
                              <h4 className="font-medium text-gray-900 dark:text-white text-xs truncate">
                                {schedule.subject.subjectName}
                              </h4>
                            )}
                            {position.height < 35 && (
                              <h4 className="font-medium text-gray-900 dark:text-white text-[10px] truncate">
                                {schedule.subject.subjectName}
                              </h4>
                            )}
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>
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

    // Get time slots with overlap detection for each day
    const getTimeSlotsForDay = (day: Date, dayOfWeek: number) => {
      const daySchedules = getSchedulesForDay(dayOfWeek, day);
      return groupOverlappingSchedules(daySchedules);
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

        {/* Time grid with relative positioning for lessons */}
        <div className="relative">
          {/* Background grid */}
          <div className="grid grid-cols-8">
            {hours.map((hour) => (
              <React.Fragment key={hour}>
                {/* Time column */}
                <div className="border-r border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 text-center min-h-[64px]">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {hour.toString().padStart(2, '0')}:00
                  </span>
                </div>
                
                {/* Day columns (empty cells for background) */}
                {weekDays.map((day, dayIndex) => (
                  <div 
                    key={`${dayIndex}-${hour}`} 
                    className="border-r border-b border-gray-200 dark:border-gray-600 last:border-r-0 min-h-[64px]"
                  />
                ))}
              </React.Fragment>
            ))}
          </div>

          {/* Lessons overlay - separate container for each day */}
          {weekDays.map((day, dayIndex) => {
            const dayOfWeek = day.getDay() || 7;
            const timeSlots = getTimeSlotsForDay(day, dayOfWeek);

            return (
              <div
                key={`lessons-${dayIndex}`}
                className="absolute inset-0 pointer-events-none"
                style={{
                  left: `calc(12.5% + ${dayIndex} * 12.5%)`, // 12.5% = 100% / 8 columns
                  width: 'calc(12.5% - 2px)',
                  height: '100%',
                  zIndex: 10
                }}
              >
                {timeSlots.map((slot, slotIndex) => {
              const hasOverlap = slot.schedules.length > 1;
              
              // Calculate position based on slot's min/max times
              const [startH, startM] = slot.startTime.split(':').map(Number);
              const [endH, endM] = slot.endTime.split(':').map(Number);
              const slotStart = startH + startM / 60;
              const slotEnd = endH + endM / 60;
              const topOffset = (slotStart - 8) * 64; // 64px per hour
              const height = Math.max(60, (slotEnd - slotStart) * 64);

              if (hasOverlap) {
                // Show overlapping indicator
                return (
                  <div
                    key={`slot-${slotIndex}`}
                    className="absolute left-1 right-1 pointer-events-auto bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 rounded border-l-2 border-amber-500 cursor-pointer hover:from-amber-200 hover:to-orange-200 dark:hover:from-amber-900/60 dark:hover:to-orange-900/60 transition-all shadow-sm hover:shadow-md p-2"
                    style={{
                      top: `${topOffset}px`,
                      height: `${height}px`
                    }}
                    onClick={() => setOverlappingModal({
                      isOpen: true,
                      schedules: slot.schedules,
                      timeSlot: formatTimeRange(slot.startTime, slot.endTime)
                    })}
                  >
                    <div className="h-full flex flex-col items-center justify-center text-center px-1">
                      <div className="text-lg font-bold text-amber-800 dark:text-amber-300">
                        {slot.schedules.length}
                      </div>
                      <div className="text-xs text-amber-700 dark:text-amber-400">
                        {slot.schedules.length === 1 ? 'занятие' : slot.schedules.length < 5 ? 'занятия' : 'занятий'}
                      </div>
                    </div>
                  </div>
                );
              } else {
                // Show single schedule
                const schedule = slot.schedules[0];
                return (
                  <div
                    key={`schedule-${schedule.id}`}
                    className="absolute left-1 right-1 pointer-events-auto bg-gradient-to-r from-violet-100 to-violet-50 dark:from-violet-900/40 dark:to-violet-900/20 rounded border-l-4 border-violet-500 cursor-pointer hover:from-violet-200 hover:to-violet-100 dark:hover:from-violet-900/60 dark:hover:to-violet-900/30 transition-all shadow-sm hover:shadow-md p-2 relative group"
                    style={{
                      top: `${topOffset}px`,
                      height: `${height}px`
                    }}
                    onClick={() => onEventClick?.(schedule)}
                    title={`${schedule.subject.subjectName}\n${schedule.group.name}\n${formatTimeRange(schedule.startTime, schedule.endTime)}\n${schedule.room.name}\n${schedule.teacher.name}`}
                  >
                    {/* Tooltip при наведении */}
                    <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-50 bg-gray-900 text-white text-xs rounded p-2 shadow-lg min-w-[200px]">
                      <div className="font-semibold mb-1">{schedule.subject.subjectName}</div>
                      <div>Группа: {schedule.group.name}</div>
                      <div>Время: {formatTimeRange(schedule.startTime, schedule.endTime)}</div>
                      <div>Кабинет: {schedule.room.name}</div>
                      <div>Преподаватель: {schedule.teacher.name}</div>
                    </div>

                    <div className="h-full overflow-hidden flex flex-col justify-center p-1">
                      {height >= 60 && (
                        <>
                          <div className="font-medium text-violet-800 dark:text-violet-300 truncate text-xs mb-0.5">
                            {schedule.subject.subjectName}
                          </div>
                          <div className="text-violet-600 dark:text-violet-400 text-[10px]">
                            {formatTimeRange(schedule.startTime, schedule.endTime)}
                          </div>
                        </>
                      )}
                      {height >= 35 && height < 60 && (
                        <div className="font-medium text-violet-800 dark:text-violet-300 truncate text-xs">
                          {schedule.subject.subjectName}
                        </div>
                      )}
                      {height < 35 && (
                        <div className="font-medium text-violet-800 dark:text-violet-300 truncate text-[10px]">
                          {schedule.subject.subjectName}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
            })}
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
                  {(() => {
                    const timeSlots = groupOverlappingSchedules(daySchedules);
                    const displaySlots = timeSlots.slice(0, 3);
                    
                    return (
                      <>
                        {displaySlots.map((slot, idx) => {
                          const hasOverlap = slot.schedules.length > 1;
                          
                          if (hasOverlap) {
                            return (
                              <div 
                                key={`slot-${idx}`}
                                className="text-xs p-1 bg-amber-100 dark:bg-amber-900/30 rounded cursor-pointer hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors border border-amber-300 dark:border-amber-600"
                                onClick={() => setOverlappingModal({
                                  isOpen: true,
                                  schedules: slot.schedules,
                                  timeSlot: formatTimeRange(slot.startTime, slot.endTime)
                                })}
                              >
                                <div className="font-medium text-amber-800 dark:text-amber-300 truncate">
                                  {slot.schedules.length} {slot.schedules.length === 1 ? 'занятие' : slot.schedules.length < 5 ? 'занятия' : 'занятий'} • {formatTimeRange(slot.startTime, slot.endTime)}
                                </div>
                              </div>
                            );
                          } else {
                            const schedule = slot.schedules[0];
                            return (
                              <div 
                                key={`${schedule.id}-${idx}`}
                                className="text-xs p-1 bg-violet-100 dark:bg-violet-900/30 rounded cursor-pointer hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors"
                                onClick={() => onEventClick?.(schedule)}
                              >
                                <div className="font-medium text-violet-800 dark:text-violet-300 truncate">
                                  {schedule.subject.subjectName}
                                </div>
                              </div>
                            );
                          }
                        })}
                        {timeSlots.length > 3 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            +{timeSlots.length - 3} еще
                          </div>
                        )}
                      </>
                    );
                  })()}
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
    <>
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

      {/* Overlapping Schedules Modal */}
      <OverlappingSchedulesModal
        isOpen={overlappingModal.isOpen}
        onClose={() => setOverlappingModal({ isOpen: false, schedules: [], timeSlot: '' })}
        schedules={overlappingModal.schedules}
        timeSlot={overlappingModal.timeSlot}
        onScheduleClick={onEventClick}
      />
    </>
  );
};