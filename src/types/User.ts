export interface User {
  id: string;
  login: string;
  name: string;
  email: string;
  phone: string;
  parentPhone: string;
  birthday: string;
  groups: string[];
  role: number;
  organizationId?: string;
  organizationName?: string;
}

export interface UserFormData {
  login: string;
  name: string;
  email: string;
  phone: string;
  parentPhone?: string;
  birthday?: string;
  organizationId?: string;
}