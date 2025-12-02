import { AuthenticatedApiService } from './AuthenticatedApiService';
import { PaymentStats, PaymentFilters, PaymentsResponse, Payment, CreatePaymentRequest, StudentPaymentGroup, Refund } from '../types/Payment';

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
   * Обработка платежей с вычислением остатков
   */
  static processPaymentWithRefunds(payment: Payment): Payment {
    if (payment.refunds && payment.refunds.length > 0) {
      const totalRefundedAmount = payment.refunds.reduce((sum, refund) => sum + refund.refundAmount, 0);
      return {
        ...payment,
        totalRefundedAmount,
        remainingAmount: payment.amount - totalRefundedAmount
      };
    }
    return {
      ...payment,
      totalRefundedAmount: 0,
      remainingAmount: payment.amount
    };
  }

  /**
   * Обработка группы платежей студента
   */
  static processStudentPaymentGroup(group: StudentPaymentGroup): StudentPaymentGroup {
    if (group.payments) {
      group.payments = group.payments.map(payment => this.processPaymentWithRefunds(payment));
    }
    return group;
  }

  /**
   * Вычисление статистики возвратов для платежа
   */
  static getPaymentRefundStats(payment: Payment): {
    totalRefunded: number;
    refundCount: number;
    remainingAmount: number;
  } {
    if (!payment.refunds || payment.refunds.length === 0) {
      return {
        totalRefunded: 0,
        refundCount: 0,
        remainingAmount: payment.amount
      };
    }

    const totalRefunded = payment.refunds.reduce((sum, refund) => sum + refund.refundAmount, 0);
    return {
      totalRefunded,
      refundCount: payment.refunds.length,
      remainingAmount: payment.amount - totalRefunded
    };
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
    
    const response = await AuthenticatedApiService.get<PaymentsResponse>(url);
    
    // Обрабатываем каждую группу платежей
    if (response.items) {
      response.items = response.items.map(group => this.processStudentPaymentGroup(group));
    }
    
    return response;
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

  /**
   * Отметить платеж как оплаченный
   * PATCH /api/Payment/{id}/paid
   */
  static async markAsPaid(id: string, paidAt: string): Promise<Payment> {
    try {
      return await AuthenticatedApiService.request<Payment>(`${this.BASE_URL}/${id}/paid`, {
        method: 'PATCH',
        body: JSON.stringify({ paidAt })
      });
    } catch (error) {
      console.error('Error marking payment as paid:', error);
      throw error;
    }
  }

  /**
   * Отменить платеж
   * PATCH /api/Payment/{id}/cancel
   */
  static async cancelPayment(id: string, cancelReason: string): Promise<Payment> {
    try {
      return await AuthenticatedApiService.request<Payment>(`${this.BASE_URL}/${id}/cancel`, {
        method: 'PATCH',
        body: JSON.stringify({ cancelReason })
      });
    } catch (error) {
      console.error('Error cancelling payment:', error);
      throw error;
    }
  }

  /**
   * Сделать полный возврат платежа
   * PATCH /api/Payment/{id}/refund
   */
  static async refundPayment(id: string, refundReason: string): Promise<Payment> {
    try {
      return await AuthenticatedApiService.request<Payment>(`${this.BASE_URL}/${id}/refund`, {
        method: 'PATCH',
        body: JSON.stringify({ refundReason })
      });
    } catch (error) {
      console.error('Error refunding payment:', error);
      throw error;
    }
  }

  /**
   * Сделать частичный возврат платежа
   * PATCH /api/Payment/{id}/partial-refund
   */
  static async partialRefundPayment(id: string, refundAmount: number, refundReason: string): Promise<Payment> {
    try {
      return await AuthenticatedApiService.request<Payment>(`${this.BASE_URL}/${id}/partial-refund`, {
        method: 'PATCH',
        body: JSON.stringify({ refundAmount, refundReason })
      });
    } catch (error) {
      console.error('Error making partial refund:', error);
      throw error;
    }
  }

  /**
   * Экспорт платежей в Excel
   * POST /api/Export/payments
   */
  static async exportPayments(
    organizationId: string,
    filters?: {
      groupId?: string;
      status?: number;
      studentId?: string;
      periodFrom?: string;
      periodTo?: string;
    }
  ): Promise<void> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const body = {
        organizationId,
        ...filters
      };

      const response = await fetch('https://trackademy.kz/api/Export/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to export payments');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payments_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting payments:', error);
      throw error;
    }
  }
}
