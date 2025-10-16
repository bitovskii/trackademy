export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  organizationId?: number;
  organizationName?: string;
  dateJoined: string;
  isActive: boolean;
}

export interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  organizationId?: number;
}