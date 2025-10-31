'use client';

import { useState, useEffect, useCallback } from 'react';
import { CalendarView, Lesson, LessonFilters, LessonsResponse, getWeekStart, getWeekEnd, getMonthStart, getMonthEnd, getDayStart, getDayEnd } from '@/types/Lesson';
import { Schedule } from '@/types/Schedule';
import { User } from '@/types/User';
import { AuthenticatedApiService } from '@/services/AuthenticatedApiService';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '@heroicons/react/24/outline';
import DayView from '@/components/calendar/DayView';
import WeekView from '@/components/calendar/WeekView';
import MonthView from '@/components/calendar/MonthView';
import ListView from '@/components/calendar/ListView';
import RangeCalendarView from '@/components/calendar/RangeCalendarView';
import LessonDetailModal from '@/components/calendar/LessonDetailModal';
import { PageHeaderWithStats } from '@/components/ui/PageHeaderWithStats';

export default function LessonsPage() {
  const { user } = useAuth();
  const router = useRouter();

  // State management
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('week');
  const [selectedSchedule, setSelectedSchedule] = useState<string>('');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [rangeViewMode, setRangeViewMode] = useState<'list' | 'calendar'>('list');

  // Check authorization
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
  }, [user, router]);

  // Load initial data
  useEffect(() => {
    if (user) {
      loadSchedules();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadLessons();
    }
  }, [selectedSchedule, currentDate, view, dateFrom, dateTo, user]);

  const loadSchedules = async () => {
    if (!user?.organizationId) {
      console.error('User organization not found');
      return;
    }

    try {
      const requestBody = {
        pageNumber: 1,
        pageSize: 1000,
        organizationId: user.organizationId
      };

      const response = await AuthenticatedApiService.post<{ items: Schedule[] }>('/Schedule/get-all-schedules', requestBody);
      setSchedules(response.items);
    } catch (error) {
      console.error('Error loading schedules:', error);
    }
  };

  const loadLessons = useCallback(async () => {
    if (!user?.organizationId) {
      console.error('User organization not found');
      return;
    }

    setLoading(true);
    try {
      const filters: LessonFilters = {
        pageNumber: 1,
        pageSize: 1000, // Large page size for calendar views
      };

      // Add schedule filter if selected
      if (selectedSchedule) {
        filters.scheduleId = selectedSchedule;
      }

      // Add date range based on current view
      const { fromDate, toDate } = getDateRangeForView(currentDate, view);
      filters.fromDate = fromDate;
      filters.toDate = toDate;

      // Create request body with organization from user
      const requestBody = {
        ...filters,
        organizationId: user.organizationId
      };

      const response = await AuthenticatedApiService.post<LessonsResponse>('/Lesson/by-schedule', requestBody);

      setLessons(response.items);
    } catch (error) {
      console.error('Error loading lessons:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedSchedule, currentDate, view, user?.organizationId]);

  const getDateRangeForView = (date: Date, viewType: CalendarView): { fromDate: string; toDate: string } => {
    // Используем локальное форматирование даты для избежания UTC сдвигов
    const formatDate = (d: Date): string => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // If custom date range is set, use it
    if (dateFrom && dateTo) {
      return {
        fromDate: formatDate(dateFrom),
        toDate: formatDate(dateTo)
      };
    }

    switch (viewType) {
      case 'day': {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);
        return {
          fromDate: formatDate(dayStart),
          toDate: formatDate(dayEnd)
        };
      }
      case 'week': {
        const weekStart = getWeekStart(date);
        const weekEnd = getWeekEnd(date);
        return {
          fromDate: formatDate(weekStart),
          toDate: formatDate(weekEnd)
        };
      }
      case 'month': {
        const monthStart = getMonthStart(date);
        const monthEnd = getMonthEnd(date);
        return {
          fromDate: formatDate(monthStart),
          toDate: formatDate(monthEnd)
        };
      }
      case 'list': {
        // For list view, load current month
        const monthStart = getMonthStart(date);
        const monthEnd = getMonthEnd(date);
        return {
          fromDate: formatDate(monthStart),
          toDate: formatDate(monthEnd)
        };
      }
      default:
        return {
          fromDate: formatDate(date),
          toDate: formatDate(date)
        };
    }
  };

  // Navigation functions
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (view) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'list':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    // Clear custom date range when going to today
    setDateFrom(null);
    setDateTo(null);
    setRangeViewMode('list');
  };

  const handleDateRangeChange = (from: Date | null, to: Date | null) => {
    setDateFrom(from);
    setDateTo(to);
    // Clear current date navigation when using custom range
    if (from && to) {
      // Set current date to the start of the range for display purposes
      setCurrentDate(from);
    }
  };

  const clearDateRange = () => {
    setDateFrom(null);
    setDateTo(null);
    setRangeViewMode('list');
  };

  const handleLessonClick = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setShowLessonModal(true);
  };

  // Format current date for display
  const getCurrentDateText = (): string => {
    // If custom date range is selected, show it
    if (dateFrom && dateTo) {
      const startDate = dateFrom.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      const endDate = dateTo.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      return `${startDate} - ${endDate}`;
    }
    
    const options: Intl.DateTimeFormatOptions = {};
    
    switch (view) {
      case 'day':
        options.weekday = 'long';
        options.day = 'numeric';
        options.month = 'long';
        options.year = 'numeric';
        break;
      case 'week': {
        const weekStart = getWeekStart(currentDate);
        const weekEnd = getWeekEnd(currentDate);
        return `${weekStart.getDate()} ${weekStart.toLocaleDateString('ru-RU', { month: 'long' })} - ${weekEnd.getDate()} ${weekEnd.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}`;
      }
      case 'month':
        options.month = 'long';
        options.year = 'numeric';
        break;
      case 'list':
        options.month = 'long';
        options.year = 'numeric';
        break;
    }
    
    return currentDate.toLocaleDateString('ru-RU', options);
  };

  const getViewTitle = (): string => {
    // If custom date range is selected, show range view mode
    if (dateFrom && dateTo) {
      return rangeViewMode === 'list' ? 'Период (Список)' : 'Период (Календарь)';
    }
    
    switch (view) {
      case 'day': return 'День';
      case 'week': return 'Неделя';
      case 'month': return 'Месяц';
      case 'list': return 'Список';
      default: return '';
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Modern Header with Gradient */}
        <PageHeaderWithStats
        title="Расписание занятий"
        subtitle="Просмотр и управление расписанием в разных форматах"
        icon={CalendarIcon}
        gradientFrom="violet-500"
        gradientTo="purple-600"
        stats={[
          { 
            label: "Всего занятий", 
            value: lessons.length, 
            color: "violet" as const
          },
          { 
            label: "Сегодня", 
            value: lessons.filter(lesson => {
              const today = new Date();
              const lessonDate = new Date(lesson.date);
              return lessonDate.toDateString() === today.toDateString();
            }).length, 
            color: "purple" as const
          },
          { 
            label: "Расписаний", 
            value: schedules.length, 
            color: "indigo" as const
          }
        ]}
      />

      {/* Content Section */}
      <div className="space-y-6">
        {/* Navigation and Calendar Content Card */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg rounded-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          {/* Filters Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-violet-50 dark:from-gray-800 dark:to-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Schedule Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Расписание</label>
                <select
                  value={selectedSchedule}
                  onChange={(e) => setSelectedSchedule(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm text-gray-900 dark:text-white transition-all duration-200"
                >
                  <option value="">Все расписания</option>
                  {schedules.map((schedule) => (
                    <option key={schedule.id} value={schedule.id}>
                      {schedule.subject.subjectName} - {schedule.group.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* View selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Вид {(dateFrom && dateTo) && <span className="text-violet-600 dark:text-violet-400">(период)</span>}
                </label>
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  {(['day', 'week', 'month', 'list'] as CalendarView[]).map((viewType) => (
                    <button
                      key={viewType}
                      onClick={() => setView(viewType)}
                      disabled={!!(dateFrom && dateTo)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        view === viewType && !(dateFrom && dateTo)
                          ? 'bg-white dark:bg-gray-600 text-violet-600 dark:text-violet-400 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                      } ${(dateFrom && dateTo) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {viewType === 'day' ? 'День' : 
                       viewType === 'week' ? 'Неделя' : 
                       viewType === 'month' ? 'Месяц' : 'Список'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="p-6 bg-gradient-to-r from-gray-50 to-violet-50 dark:from-gray-700/50 dark:to-gray-600/50 border-b border-gray-200 dark:border-gray-700">
            {/* Date Range Selection */}
            <div className="mb-4 p-4 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm rounded-lg border border-gray-200/50 dark:border-gray-600/50">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Выбор диапазона дат</label>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 dark:text-gray-400">С:</label>
                  <input
                    type="date"
                    value={dateFrom ? dateFrom.toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        const newDateFrom = new Date(e.target.value);
                        handleDateRangeChange(newDateFrom, dateTo);
                      }
                    }}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 dark:text-gray-400">До:</label>
                  <input
                    type="date"
                    value={dateTo ? dateTo.toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        const newDateTo = new Date(e.target.value);
                        handleDateRangeChange(dateFrom, newDateTo);
                      }
                    }}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  />
                </div>
                
                {(dateFrom || dateTo) && (
                  <button
                    onClick={clearDateRange}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-md text-sm transition-colors"
                  >
                    Очистить
                  </button>
                )}
              </div>
              
              {/* Range View Mode Selector */}
              {(dateFrom && dateTo) && (
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Режим просмотра:</label>
                  <div className="flex bg-gray-100 dark:bg-gray-600 rounded-lg p-1">
                    <button
                      onClick={() => setRangeViewMode('list')}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                        rangeViewMode === 'list'
                          ? 'bg-white dark:bg-gray-700 text-violet-600 dark:text-violet-400 shadow-sm'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      Список
                    </button>
                    <button
                      onClick={() => setRangeViewMode('calendar')}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                        rangeViewMode === 'calendar'
                          ? 'bg-white dark:bg-gray-700 text-violet-600 dark:text-violet-400 shadow-sm'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      Календарь
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigateDate('prev')}
                  disabled={!!(dateFrom || dateTo)}
                  className="bg-violet-100 hover:bg-violet-200 dark:bg-violet-900/30 dark:hover:bg-violet-800/50 text-violet-700 dark:text-violet-300 p-2 rounded-lg transition-all duration-200 hover:scale-105 flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                
                <button
                  onClick={goToToday}
                  disabled={!!(dateFrom || dateTo)}
                  className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  Сегодня
                </button>
                
                <button
                  onClick={() => navigateDate('next')}
                  disabled={!!(dateFrom || dateTo)}
                  className="bg-violet-100 hover:bg-violet-200 dark:bg-violet-900/30 dark:hover:bg-violet-800/50 text-violet-700 dark:text-violet-300 p-2 rounded-lg transition-all duration-200 hover:scale-105 flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-200/50 dark:border-gray-600/50 shadow-lg">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {getCurrentDateText()}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  {getViewTitle()}
                </div>
              </div>
            </div>
          </div>

          {/* Calendar Content */}
          {loading ? (
            <div className="flex justify-center items-center h-64 p-8">
              <div className="text-center">
                <div className="p-4 bg-violet-100 dark:bg-violet-900/30 rounded-full w-16 h-16 mx-auto mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 dark:border-violet-400 mx-auto mt-2"></div>
                </div>
                <p className="text-gray-600 dark:text-gray-400">Загрузка календаря...</p>
              </div>
            </div>
          ) : (
            <div className="h-[700px]">
              {/* If custom date range is selected, show based on rangeViewMode */}
              {(dateFrom && dateTo) ? (
                rangeViewMode === 'list' ? (
                  <ListView
                    date={currentDate}
                    lessons={lessons}
                    onLessonClick={handleLessonClick}
                  />
                ) : (
                  <RangeCalendarView
                    dateFrom={dateFrom}
                    dateTo={dateTo}
                    lessons={lessons}
                    onLessonClick={handleLessonClick}
                  />
                )
              ) : (
                <>
                  {view === 'day' && (
                    <DayView
                      date={currentDate}
                      lessons={lessons}
                      onLessonClick={handleLessonClick}
                    />
                  )}
                  
                  {view === 'week' && (
                    <WeekView
                      date={currentDate}
                      lessons={lessons}
                      onLessonClick={handleLessonClick}
                    />
                  )}
                  
                  {view === 'month' && (
                    <MonthView
                      date={currentDate}
                      lessons={lessons}
                      onLessonClick={handleLessonClick}
                    />
                  )}
                  
                  {view === 'list' && (
                    <ListView
                      date={currentDate}
                      lessons={lessons}
                      onLessonClick={handleLessonClick}
                    />
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lesson Details Modal */}
      {selectedLesson && (
        <LessonDetailModal
          lesson={selectedLesson}
          isOpen={showLessonModal}
          onClose={() => setShowLessonModal(false)}
          onUpdate={loadLessons}
        />
      )}
      </div>
    </div>
  );
}