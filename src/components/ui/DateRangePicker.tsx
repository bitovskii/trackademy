'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CalendarIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface DateRangePickerProps {
  startDate?: string;
  endDate?: string;
  onDateChange: (startDate?: string, endDate?: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onDateChange,
  placeholder = "Выберите период",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingStart, setSelectingStart] = useState(true);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const calendarHeight = 450; // Примерная высота календаря
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;
      
      // Определяем, где больше места - сверху или снизу
      const shouldOpenBelow = spaceAbove < calendarHeight && spaceBelow > spaceAbove;
      
      if (shouldOpenBelow) {
        // Открываем снизу
        setPosition({
          top: rect.bottom + 10,
          left: rect.left
        });
      } else {
        // Открываем сверху, но не выше верхней границы экрана
        const topPosition = Math.max(10, rect.top - calendarHeight - 10);
        setPosition({
          top: topPosition,
          left: rect.left
        });
      }
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (date: string) => {
    // Парсим дату как локальную (без сдвига часового пояса)
    const [year, month, day] = date.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    
    return localDate.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDisplayText = () => {
    if (startDate && endDate) {
      return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    }
    if (startDate) {
      return `С ${formatDate(startDate)}`;
    }
    if (endDate) {
      return `До ${formatDate(endDate)}`;
    }
    return placeholder;
  };

  const clearDates = () => {
    onDateChange(undefined, undefined);
    setSelectingStart(true);
  };

  const handleDateClick = (date: Date) => {
    // Форматируем дату как локальную строку YYYY-MM-DD без сдвига часового пояса
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    if (selectingStart || !startDate) {
      onDateChange(dateString, undefined);
      setSelectingStart(false);
    } else {
      const startDateTime = new Date(startDate).getTime();
      const selectedDateTime = date.getTime();
      
      if (selectedDateTime < startDateTime) {
        // If selected date is before start date, make it the new start date
        onDateChange(dateString, startDate);
      } else {
        // Normal case: set end date
        onDateChange(startDate, dateString);
        setIsOpen(false);
        setSelectingStart(true);
      }
    }
  };

  const isDateInRange = (date: Date) => {
    if (!startDate) return false;
    
    const dateTime = date.getTime();
    const startTime = new Date(startDate).getTime();
    
    if (!endDate && hoverDate && !selectingStart) {
      const hoverTime = hoverDate.getTime();
      return dateTime >= Math.min(startTime, hoverTime) && dateTime <= Math.max(startTime, hoverTime);
    }
    
    if (endDate) {
      const endTime = new Date(endDate).getTime();
      return dateTime >= startTime && dateTime <= endTime;
    }
    
    return false;
  };

  const isDateSelected = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    return dateString === startDate || dateString === endDate;
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    // const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    
    // Начинаем с понедельника
    const startDayOfWeek = (firstDay.getDay() + 6) % 7;
    startDate.setDate(firstDay.getDate() - startDayOfWeek);
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    
    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <div className="relative">
      {/* Input Field */}
      <button
        ref={buttonRef}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-4 py-3 border border-gray-300 dark:border-gray-600 
                   rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                   disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
                   hover:border-gray-400 dark:hover:border-gray-500 ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
      >
        <div className="flex items-center space-x-3">
          <CalendarIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <span className={`${(!startDate && !endDate) ? 'text-gray-500 dark:text-gray-400' : ''}`}>
            {getDisplayText()}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {(startDate || endDate) && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                clearDates();
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  clearDates();
                }
              }}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors cursor-pointer"
            >
              <XMarkIcon className="h-4 w-4 text-gray-400" />
            </div>
          )}
        </div>
      </button>

      {/* Calendar Dropdown - Rendered as Portal */}
      {mounted && isOpen && createPortal(
        <div 
          ref={dropdownRef}
          className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                     rounded-xl shadow-2xl z-[9999] p-4 w-80 max-w-[calc(100vw-2rem)]"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronRightIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Selection Info */}
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            {selectingStart ? 'Выберите дату начала' : 'Выберите дату окончания'}
          </div>

          {/* Week Days */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {generateCalendarDays().map((date, index) => {
              const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
              const isToday = date.toDateString() === new Date().toDateString();
              const isSelected = isDateSelected(date);
              const isInRange = isDateInRange(date);
              const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(date)}
                  onMouseEnter={() => setHoverDate(date)}
                  onMouseLeave={() => setHoverDate(null)}
                  className={`
                    relative h-10 w-10 text-sm rounded-lg transition-all duration-200 hover:scale-105
                    ${isCurrentMonth 
                      ? isSelected 
                        ? 'bg-blue-600 text-white font-bold shadow-lg' 
                        : isInRange
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : isToday
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold border border-blue-300'
                            : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                      : 'text-gray-400 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }
                    ${isPast && isCurrentMonth ? 'opacity-60' : ''}
                  `}
                >
                  {date.getDate()}
                  {isToday && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => {
                  const today = new Date();
                  const year = today.getFullYear();
                  const month = String(today.getMonth() + 1).padStart(2, '0');
                  const day = String(today.getDate()).padStart(2, '0');
                  const todayString = `${year}-${month}-${day}`;
                  onDateChange(todayString, todayString);
                  setIsOpen(false);
                  setSelectingStart(true);
                }}
                className="px-3 py-2 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 
                         rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
              >
                Сегодня
              </button>
              
              <button
                onClick={() => {
                  const today = new Date();
                  const weekAgo = new Date(today);
                  weekAgo.setDate(today.getDate() - 7);
                  
                  const todayYear = today.getFullYear();
                  const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
                  const todayDay = String(today.getDate()).padStart(2, '0');
                  const todayString = `${todayYear}-${todayMonth}-${todayDay}`;
                  
                  const weekYear = weekAgo.getFullYear();
                  const weekMonth = String(weekAgo.getMonth() + 1).padStart(2, '0');
                  const weekDay = String(weekAgo.getDate()).padStart(2, '0');
                  const weekAgoString = `${weekYear}-${weekMonth}-${weekDay}`;
                  
                  onDateChange(weekAgoString, todayString);
                  setIsOpen(false);
                  setSelectingStart(true);
                }}
                className="px-3 py-2 text-sm bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 
                         rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
              >
                7 дней
              </button>
              
              <button
                onClick={() => {
                  const today = new Date();
                  // Первый день текущего месяца
                  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                  
                  const todayYear = today.getFullYear();
                  const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
                  const todayDay = String(today.getDate()).padStart(2, '0');
                  const todayString = `${todayYear}-${todayMonth}-${todayDay}`;
                  
                  const startYear = monthStart.getFullYear();
                  const startMonth = String(monthStart.getMonth() + 1).padStart(2, '0');
                  const startDay = String(monthStart.getDate()).padStart(2, '0');
                  const monthStartString = `${startYear}-${startMonth}-${startDay}`;
                  
                  onDateChange(monthStartString, todayString);
                  setIsOpen(false);
                  setSelectingStart(true);
                }}
                className="px-3 py-2 text-sm bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 
                         rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
              >
                Месяц
              </button>
              
              <button
                onClick={() => {
                  const today = new Date();
                  // Первый день текущего года
                  const yearStart = new Date(today.getFullYear(), 0, 1);
                  
                  const todayYear = today.getFullYear();
                  const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
                  const todayDay = String(today.getDate()).padStart(2, '0');
                  const todayString = `${todayYear}-${todayMonth}-${todayDay}`;
                  
                  const startYear = yearStart.getFullYear();
                  const startMonth = String(yearStart.getMonth() + 1).padStart(2, '0');
                  const startDay = String(yearStart.getDate()).padStart(2, '0');
                  const yearStartString = `${startYear}-${startMonth}-${startDay}`;
                  
                  onDateChange(yearStartString, todayString);
                  setIsOpen(false);
                  setSelectingStart(true);
                }}
                className="px-3 py-2 text-sm bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 
                         rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors"
              >
                Год
              </button>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={() => {
                  clearDates();
                  setIsOpen(false);
                  setSelectingStart(true);
                }}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 
                         px-4 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Очистить
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};