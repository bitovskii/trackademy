export interface User {
  id: string;
  login: string;
  name: string;
  email: string;
  phone: string;
  parentPhone: string;
  birthday: string;
  groups: (string | { id: string; name?: string; groupName?: string })[];
  role: number;
  organizationId?: string;
  organizationName?: string;
}

export interface UserFormData {
  login: string;
  fullName: string;
  email: string;
  password?: string;
  phone: string;
  parentPhone?: string;
  birthday?: string;
  role: number;
  organizationId?: string;
}