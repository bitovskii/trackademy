import { User, UserFormData } from '../types/User';
import { Organization, OrganizationFormData } from '../types/Organization';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://trackademy.onrender.com/api';

export class ApiService {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Check if response has content before trying to parse JSON
      const contentLength = response.headers.get('content-length');
      const contentType = response.headers.get('content-type');
      
      // If content-length is 0 or there's no content-type indicating JSON, return empty response
      if (contentLength === '0' || (!contentType?.includes('application/json') && !response.body)) {
        return undefined as T;
      }
      
      // Try to get text first to check if there's any content
      const text = await response.text();
      if (!text) {
        return undefined as T;
      }
      
      return JSON.parse(text);
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // User API methods
  static async getUsers(): Promise<User[]> {
    return this.request<User[]>('/User/get-users');
  }

  static async getUserById(id: number): Promise<User> {
    return this.request<User>(`/User/get-user/${id}`);
  }

  static async createUser(userData: UserFormData): Promise<User> {
    return this.request<User>('/User/create-user', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  static async updateUser(id: number, userData: UserFormData): Promise<User> {
    return this.request<User>(`/User/update-user/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  static async deleteUser(id: number): Promise<void> {
    return this.request<void>(`/User/delete-user/${id}`, {
      method: 'DELETE',
    });
  }

  // Organization API methods
  static async getOrganizations(): Promise<Organization[]> {
    return this.request<Organization[]>('/Organization');
  }

  static async getOrganizationById(id: number): Promise<Organization> {
    return this.request<Organization>(`/Organization/get-organization/${id}`);
  }

  static async createOrganization(orgData: OrganizationFormData): Promise<Organization> {
    return this.request<Organization>('/Organization/create', {
      method: 'POST',
      body: JSON.stringify(orgData),
    });
  }

  static async updateOrganization(id: number, orgData: OrganizationFormData): Promise<Organization> {
    return this.request<Organization>(`/Organization/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orgData),
    });
  }

  static async deleteOrganization(id: number): Promise<void> {
    return this.request<void>(`/Organization/${id}`, {
      method: 'DELETE',
    });
  }
}