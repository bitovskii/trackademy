/**
 * Authenticated API service that includes JWT token in requests
 */
import { User, UserFormData } from '../types/User';
import { Organization, OrganizationFormData } from '../types/Organization';
import { Room, RoomFormData } from '../types/Room';
import { Subject, SubjectFormData } from '../types/Subject';
import { GroupsResponse } from '../types/Group';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface UsersResponse {
  items: User[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export class AuthenticatedApiService {
  private static getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private static getAuthHeaders(): Record<string, string> {
    const token = this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const API_BASE_URL = 'https://trackademy.onrender.com/api';
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid - redirect to login
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          globalThis.location.href = '/login';
          throw new Error('Authentication expired');
        }
        
        // Try to get error details from response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.text();
          if (errorData) {
            errorMessage += ` - ${errorData}`;
          }
        } catch (e) {
          // Ignore error parsing errors
        }
        
        throw new Error(errorMessage);
      }
      
      const contentLength = response.headers.get('content-length');
      const contentType = response.headers.get('content-type');
      
      if (contentLength === '0' || !contentType?.includes('application/json')) {
        return {} as T;
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Common HTTP methods
  static async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  static async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // User management methods
  static async updateUser(id: string, userData: UserFormData): Promise<ApiResponse<User>> {
    return this.put(`/User/update-user/${id}`, userData);
  }

  static async deleteUser(id: string): Promise<ApiResponse<boolean>> {
    return this.delete(`/User/${id}`);
  }

  static async createUser(userData: UserFormData): Promise<ApiResponse<User>> {
    return this.post('/User', userData);
  }

  static async getUsers(filters: {
    organizationId: string;
    pageNumber?: number;
    pageSize?: number;
    search?: string;
    groupIds?: string[];
    roleIds?: number[];
  }): Promise<UsersResponse> {
    const body = {
      pageNumber: filters.pageNumber || 1,
      pageSize: filters.pageSize || 10,
      organizationId: filters.organizationId,
      ...(filters.search && { search: filters.search }),
      ...(filters.groupIds && filters.groupIds.length > 0 && { groupIds: filters.groupIds }),
      ...(filters.roleIds && filters.roleIds.length > 0 && { roleIds: filters.roleIds })
    };
    
    return this.post('/User/get-users', body);
  }

  // Organization management methods
  static async getOrganizations(): Promise<Organization[]> {
    return this.get('/Organization');
  }

  static async createOrganization(orgData: OrganizationFormData): Promise<ApiResponse<Organization>> {
    return this.post('/Organization', orgData);
  }

  static async updateOrganization(id: string, orgData: OrganizationFormData): Promise<ApiResponse<Organization>> {
    return this.put(`/Organization/${id}`, orgData);
  }

  static async deleteOrganization(id: string): Promise<ApiResponse<boolean>> {
    return this.delete(`/Organization/${id}`);
  }

  // Room management methods
  static async getRooms(organizationId: string): Promise<Room[]> {
    return this.get(`/Room?organizationId=${organizationId}`);
  }

  static async createRoom(roomData: RoomFormData): Promise<ApiResponse<Room>> {
    return this.post('/Room', roomData);
  }

  static async updateRoom(id: string, roomData: RoomFormData): Promise<ApiResponse<Room>> {
    return this.put(`/Room/${id}`, roomData);
  }

  static async deleteRoom(id: string): Promise<ApiResponse<boolean>> {
    return this.delete(`/Room/${id}`);
  }

  // Subject management methods
  static async getSubjects(organizationId: string): Promise<Subject[]> {
    return this.get(`/Subject?organizationId=${organizationId}`);
  }

  static async createSubject(subjectData: SubjectFormData): Promise<ApiResponse<Subject>> {
    return this.post('/Subject', subjectData);
  }

  static async updateSubject(id: string, subjectData: SubjectFormData): Promise<ApiResponse<Subject>> {
    return this.put(`/Subject/${id}`, subjectData);
  }

  static async deleteSubject(id: string): Promise<ApiResponse<boolean>> {
    return this.delete(`/Subject/${id}`);
  }

  // Group management methods
  static async getGroups(organizationId: string, pageSize: number = 1000): Promise<GroupsResponse> {
    const body = {
      pageNumber: 1,
      pageSize: pageSize,
      organizationId: organizationId
    };
    return this.post('/Group/get-groups', body);
  }
}