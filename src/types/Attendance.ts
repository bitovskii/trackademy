// Attendance API Types

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentLogin: string;
  lessonId: string;
  date: string; // "2025-10-22" format
  plannedLessonDate: string; // "2025-10-22" format
  status: AttendanceStatus;
  statusName: string;
  subjectName: string;
  groupName: string;
  teacherName: string;
  startTime: string; // "09:00:00" format
  endTime: string; // "10:30:00" format
}

export interface AttendanceResponse {
  items: AttendanceRecord[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AttendanceFilters {
  organizationId: string;
  studentSearch?: string;
  groupId?: string;
  subjectId?: string;
  status?: AttendanceStatus;
  fromDate?: string;
  toDate?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface StudentAttendanceStats {
  studentId: string;
  studentName: string;
  totalLessons: number;
  attendedLessons: number;
  missedLessons: number;
  lateLessons: number;
  specialReasonLessons: number;
  attendancePercentage: number;
}

export interface GroupReportLesson {
  lessonId: string;
  date: string;
  subjectName: string;
  startTime: string;
  endTime: string;
  status: AttendanceStatus;
  statusName: string;
}

export interface GroupReportStudent {
  studentId: string;
  studentName: string;
  studentLogin: string;
  lessons: GroupReportLesson[];
}

export type GroupReport = GroupReportStudent[];

export interface BulkAttendanceRequest {
  lessonId: string;
  attendances: {
    studentId: string;
    status: AttendanceStatus;
  }[];
}

export interface UpdateAttendanceRequest {
  studentId: string;
  lessonId: string;
  status: AttendanceStatus;
}

export interface ExportAttendanceRequest {
  organizationId: string;
  groupId?: string;
  subjectId?: string;
  studentIds?: string[];
  fromDate: string;
  toDate: string;
  status?: AttendanceStatus;
}

export type AttendanceStatus = 1 | 2 | 3 | 4;

// Re-export from Lesson.ts to avoid duplication
export { 
  getAttendanceStatusText, 
  getAttendanceStatusColor 
} from './Lesson';

// Additional helper functions specific to Attendance
export const getAttendanceStatusBgColor = (status: AttendanceStatus): string => {
  switch (status) {
    case 1:
      return '#10B98120'; // Green with opacity
    case 2:
      return '#EF444420'; // Red with opacity
    case 3:
      return '#F59E0B20'; // Yellow with opacity
    case 4:
      return '#8B5CF620'; // Purple with opacity
    default:
      return '#6B728020'; // Gray with opacity
  }
};

export const getAttendanceStatusIcon = (status: AttendanceStatus): string => {
  switch (status) {
    case 1:
      return '✓'; // Присутствовал
    case 2:
      return '✗'; // Отсутствовал
    case 3:
      return '⏰'; // Опоздал
    case 4:
      return '📋'; // Уважительная причина
    default:
      return '❓';
  }
};