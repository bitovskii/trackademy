export interface UserGroup {
  id: string;
  name: string;
}

export interface User {
  id: string;
  login: string;
  name: string;
  email: string;
  phone: string;
  parentPhone: string | null;
  birthday: string | null;
  groups: UserGroup[];
  role: number;
  organizationId?: string;
  organizationName?: string;
  isTrial: boolean;
}

export interface UserFormData {
  id?: string;
  login: string;
  fullName: string;
  email: string | null;
  password?: string;
  phone: string | null;
  parentPhone?: string | null;
  birthday?: string | null;
  role: number;
  organizationId?: string;
  isTrial: boolean;
}