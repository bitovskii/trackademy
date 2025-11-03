export interface DashboardSummary {
  totalStudents: number;
  activeStudents: number;
  totalGroups: number;
  activeGroups: number;
  lessonsToday: number;
  completedLessonsToday: number;
  averageAttendanceRate: number;
  unpaidStudentsCount: number;
  trialStudentsCount: number;
  lowPerformanceGroupsCount: number;
  totalDebt: number;
  lastUpdated: string;
}

export interface DashboardFilters {
  organizationId: string;
  startDate?: string;
  endDate?: string;
  groupIds?: string[];
  subjectIds?: string[];
  includeInactiveStudents?: boolean;
  lowPerformanceThreshold?: number;
}

export interface DashboardStats {
  label: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo' | 'emerald' | 'orange';
  description?: string;
}