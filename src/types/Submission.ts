export enum SubmissionStatus {
  Draft = 0,
  Submitted = 1,
  Graded = 2,
  Returned = 3,
  Overdue = 4
}

export interface SubmissionFile {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  textContent: string | null;
  status: SubmissionStatus;
  score: number | null;
  teacherComment: string | null;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  gradedAt: string | null;
  files: SubmissionFile[];
  assignment?: {
    id: string;
    description: string;
    dueDate: string;
  };
  group?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface SubmissionFilters {
  pageNumber: number;
  pageSize: number;
  organizationId: string;
  assignmentId?: string;
  groupId?: string;
  studentId?: string;
  status?: SubmissionStatus;
  fromDate?: string;
  toDate?: string;
}

export interface SubmissionsResponse {
  items: Submission[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface GradeSubmissionRequest {
  score: number;
  teacherComment?: string;
}

export interface ReturnSubmissionRequest {
  teacherComment: string;
}
