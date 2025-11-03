export interface Schedule {
  id: string;
  daysOfWeek: number[];
  startTime: string; // "09:00:00" format
  endTime: string;   // "10:30:00" format
  effectiveFrom: string; // "2025-10-18" format
  effectiveTo: string | null; // null means indefinite
  subject: {
    subjectId: string;
    subjectName: string;
  };
  group: {
    id: string;
    name: string;
  };
  teacher: {
    id: string;
    name: string;
  };
  room: {
    id: string;
    name: string;
  };
}

export interface ScheduleFormData {
  daysOfWeek: number[];
  startTime: string | null; // "09:00:00" format or null
  endTime: string | null;   // "10:00:00" format or null
  effectiveFrom: string | null; // "2025-10-27" format or null
  effectiveTo?: string | null; // Optional or null
  groupId: string | null;
  teacherId: string | null;
  roomId: string | null;
  organizationId: string;
}

export interface ScheduleUpdateData {
  daysOfWeek: number[];
  startTime: {
    ticks: number;
  };
  endTime: {
    ticks: number;
  };
  effectiveFrom: string;
  effectiveTo?: string;
  groupId: string;
  teacherId: string;
  roomId: string;
}

export interface SchedulesResponse {
  items: Schedule[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ScheduleFilters {
  pageNumber: number;
  pageSize: number;
  organizationId: string;
  groupId?: string;
  teacherId?: string;
  roomId?: string;
  subjectId?: string;
}

// Helper functions for days of week
export const getDayName = (dayNumber: number): string => {
  const days = {
    1: 'Понедельник',
    2: 'Вторник', 
    3: 'Среда',
    4: 'Четверг',
    5: 'Пятница',
    6: 'Суббота',
    7: 'Воскресенье'
  };
  return days[dayNumber as keyof typeof days] || 'Неизвестный день';
};

export const getDayShortName = (dayNumber: number): string => {
  const days = {
    1: 'Пн',
    2: 'Вт',
    3: 'Ср', 
    4: 'Чт',
    5: 'Пт',
    6: 'Сб',
    7: 'Вс'
  };
  return days[dayNumber as keyof typeof days] || '??';
};

export const formatDaysOfWeek = (daysOfWeek: number[]): string => {
  return daysOfWeek
    .sort((a, b) => a - b)
    .map(day => getDayShortName(day))
    .join(', ');
};

export const formatTime = (timeString: string): string => {
  // Convert "09:00:00" to "09:00"
  return timeString.substring(0, 5);
};

export const formatTimeRange = (startTime: string, endTime: string): string => {
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};

export const formatEffectivePeriod = (effectiveFrom: string, effectiveTo: string | null): string => {
  const fromDate = new Date(effectiveFrom).toLocaleDateString('ru-RU');
  if (!effectiveTo) {
    return `с ${fromDate} (Бессрочно)`;
  }
  const toDate = new Date(effectiveTo).toLocaleDateString('ru-RU');
  return `${fromDate} - ${toDate}`;
};

// Helper to convert time string to TimeSpan ticks for API
export const timeStringToTicks = (timeString: string): number => {
  const [hours, minutes, seconds = 0] = timeString.split(':').map(Number);
  return (hours * 3600 + minutes * 60 + seconds) * 10000000; // .NET ticks
};

// Generate random colors for subjects
export const generateSubjectColor = (subjectName: string): string => {
  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Emerald
    '#8B5CF6', // Violet
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange
    '#EC4899', // Pink
    '#6366F1', // Indigo
  ];
  
  // Generate consistent color based on subject name hash
  let hash = 0;
  for (let i = 0; i < subjectName.length; i++) {
    hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};
