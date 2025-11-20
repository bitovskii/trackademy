export interface Subject {
  id: string;
  name: string;
  description: string;
  price?: number;
  organizationId: string;
}

export interface SubjectFormData {
  name: string;
  description: string;
  price?: number;
  [key: string]: unknown;
}