import { AuthenticatedApiService } from './AuthenticatedApiService';
import { User } from '../types/User';

export class UserApiService extends AuthenticatedApiService {
  
  /**
   * Получить пользователя по ID
   * GET /api/User/GetUserById/{id}
   */
  static async getUserById(id: string): Promise<User> {
    try {
      return await this.request<User>(`/User/GetUserById/${id}`, {
        method: 'GET'
      });
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }
  }
}