export interface Assignment {
  id: string;
  description: string;
  groupId: string;
  assignedDate: string;
  dueDate: string;
  createdAt: string;
  group: {
    id: string;
    name: string;
    code: string;
  };
}

export interface AssignmentFormData {
  description: string;
  groupId: string;
  assignedDate: string;
  dueDate: string;
}

export interface AssignmentsResponse {
  items: Assignment[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface AssignmentFilters {
  organizationId: string;
  groupId?: string;
  fromDate?: string;
  toDate?: string;
  pageNumber: number;
  pageSize: number;
}
