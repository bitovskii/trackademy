import { AuthenticatedApiService } from './AuthenticatedApiService';
import { PaymentStats, PaymentFilters, PaymentsResponse, Payment, CreatePaymentRequest } from '../types/Payment';

export class PaymentApiService {
  private static readonly BASE_URL = '/Payment';

  /**
   * Получение статистики платежей
   * GET /api/Payment/stats
   */
  static async getPaymentStats(
    organizationId: string,
    groupId?: string,
    studentId?: string
  ): Promise<PaymentStats> {
    const params = new URLSearchParams({
      organizationId: organizationId
    });

    if (groupId) {
      params.append('groupId', groupId);
    }
    if (studentId) {
      params.append('studentId', studentId);
    }

    const url = `${this.BASE_URL}/stats?${params.toString()}`;
    
    return AuthenticatedApiService.get<PaymentStats>(url);
  }

  /**
   * Получение списка платежей
   * GET /api/Payment
   */
  static async getPayments(filters: PaymentFilters): Promise<PaymentsResponse> {
    const params = new URLSearchParams({
      organizationId: filters.organizationId
    });

    // Добавляем опциональные параметры
    if (filters.groupId) {
      params.append('groupId', filters.groupId);
    }
    if (filters.status !== undefined) {
      params.append('status', filters.status.toString());
    }
    if (filters.type !== undefined) {
      params.append('type', filters.type.toString());
    }
    if (filters.fromDate) {
      params.append('fromDate', filters.fromDate);
    }
    if (filters.toDate) {
      params.append('toDate', filters.toDate);
    }
    if (filters.page !== undefined) {
      params.append('page', filters.page.toString());
    }
    if (filters.pageSize !== undefined) {
      params.append('pageSize', filters.pageSize.toString());
    }

    const url = `${this.BASE_URL}?${params.toString()}`;
    
    return AuthenticatedApiService.get<PaymentsResponse>(url);
  }

  /**
   * Получение платежа по ID (для будущего использования)
   */
  static async getPaymentById(id: string): Promise<Payment> {
    return AuthenticatedApiService.get<Payment>(`${this.BASE_URL}/${id}`);
  }

  /**
   * Создание нового платежа
   * POST /api/Payment
   */
  static async createPayment(paymentData: CreatePaymentRequest): Promise<Payment> {
    try {
      return await AuthenticatedApiService.request<Payment>(this.BASE_URL, {
        method: 'POST',
        body: JSON.stringify(paymentData)
      });
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  // Здесь будут добавлены CRUD операции когда API будет готово:
  // - updatePayment  
  // - deletePayment
  // - markAsPaid
  // - refundPayment
}