'use client';

import { useState, useEffect, useCallback } from 'react';
import { CalendarView, Lesson, LessonFilters, LessonsResponse } from '@/types/Lesson';
import { Schedule } from '@/types/Schedule';
import { User } from '@/types/User';
import { AuthenticatedApiService } from '@/services/AuthenticatedApiService';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import DayView from '@/components/calendar/DayView';
import WeekView from '@/components/calendar/WeekView';
import MonthView from '@/components/calendar/MonthView';
import ListView from '@/components/calendar/ListView';
import LessonDetailModal from '@/components/calendar/LessonDetailModal';

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
  }, [selectedSchedule, currentDate, view, user]);

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
    const formatDate = (d: Date): string => d.toISOString().split('T')[0];

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

  // Helper functions from Lesson types
  const getWeekStart = (date: Date): Date => {
    const result = new Date(date);
    const day = result.getDay();
    const diff = result.getDate() - day + (day === 0 ? -6 : 1);
    result.setDate(diff);
    result.setHours(0, 0, 0, 0);
    return result;
  };

  const getWeekEnd = (date: Date): Date => {
    const weekStart = getWeekStart(date);
    const result = new Date(weekStart);
    result.setDate(result.getDate() + 6);
    result.setHours(23, 59, 59, 999);
    return result;
  };

  const getMonthStart = (date: Date): Date => {
    const result = new Date(date);
    result.setDate(1);
    result.setHours(0, 0, 0, 0);
    return result;
  };

  const getMonthEnd = (date: Date): Date => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + 1, 0);
    result.setHours(23, 59, 59, 999);
    return result;
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
  };

  const handleLessonClick = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setShowLessonModal(true);
  };

  // Format current date for display
  const getCurrentDateText = (): string => {
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 lg:mb-0">
            Календарь занятий
          </h1>
          
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Schedule filter */}
              <select
                value={selectedSchedule}
                onChange={(e) => setSelectedSchedule(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Все расписания</option>
                {schedules.map((schedule) => (
                  <option key={schedule.id} value={schedule.id}>
                    {schedule.subject.subjectName} - {schedule.group.name}
                  </option>
                ))}
              </select>            {/* View selector */}
            <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
              {(['day', 'week', 'month', 'list'] as CalendarView[]).map((viewType) => (
                <button
                  key={viewType}
                  onClick={() => setView(viewType)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    view === viewType
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {viewType === 'day' ? 'День' : 
                   viewType === 'week' ? 'Неделя' : 
                   viewType === 'month' ? 'Месяц' : 'Список'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                       text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 
                       transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                       transition-colors font-medium"
            >
              Сегодня
            </button>
            
            <button
              onClick={() => navigateDate('next')}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                       text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 
                       transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="text-xl font-semibold text-gray-900 dark:text-white">
            {getCurrentDateText()}
          </div>
        </div>

        {/* Calendar Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-[600px]">
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
          </div>
        )}
      </div>

      {/* Lesson Details Modal */}
      {selectedLesson && (
        <LessonDetailModal
          lesson={selectedLesson}
          isOpen={showLessonModal}
          onClose={() => setShowLessonModal(false)}
        />
      )}
    </div>
  );
}