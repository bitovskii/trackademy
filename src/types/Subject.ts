export interface Subject {
  id: string;
  name: string;
  description: string;
  organizationId: string;
}

export interface SubjectFormData {
  name: string;
  description: string;
}