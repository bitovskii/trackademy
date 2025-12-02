export interface MyAssignment {
  assignmentId: string;
  description: string;
  groupId: string;
  assignedDate: string;
  dueDate: string;
  group: {
    id: string;
    name: string;
  };
  subject: {
    id: string;
    name: string;
  };
  submissionId: string | null;
  status: string | null;
  score: number | null;
}

export interface MyAssignmentsResponse {
  pending: MyAssignment[];
  submitted: MyAssignment[];
  graded: MyAssignment[];
  overdue: MyAssignment[];
}

export interface MyAssignmentsRequest {
  OrganizationId: string;
}
