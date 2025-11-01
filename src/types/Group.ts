export interface GroupSubject {
  subjectId: string;
  subjectName: string;
}

export interface GroupStudent {
  studentId: string;
  studentName: string;
}

export interface Group {
  id: string;
  name: string;
  code: string;
  level: string;
  description?: string;
  subject: GroupSubject;
  students: GroupStudent[];
}

export interface GroupFormData {
  name: string;
  code: string;
  level: string;
  description?: string;
  subjectId: string;
  studentIds: string[];
  organizationId: string;
}

export interface GroupsResponse {
  items: Group[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}