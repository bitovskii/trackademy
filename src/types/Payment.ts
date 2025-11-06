export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled' | 'refunded';

export const PaymentStatusEnum = {
  Pending: 1,
  Paid: 2, 
  Overdue: 3,
  Cancelled: 4,
  Refunded: 5
} as const;

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  groupId: string;
  groupName: string;
  paymentPeriod: string;
  type: number;
  typeName: string;
  originalAmount: number;
  discountPercentage: number;
  amount: number;
  discountReason: string;
  periodStart: string;
  periodEnd: string;
  status: number;
  statusName: string;
  paidAt: string | null;
  createdAt: string;
  cancelledAt: string | null;
  cancelReason: string | null;
  isOverdue: boolean;
  daysUntilEnd: number;
}

export interface PaymentFormData {
  id?: string;
  studentId: string;
  groupId?: string;
  paymentPeriod: string;
  type: number;
  originalAmount: number;
  discountPercentage: number;
  amount: number;
  discountReason?: string;
  periodStart: string;
  periodEnd: string;
  status: number;
}

// Для статистики платежей (соответствует реальному API /api/Payment/stats)
export interface PaymentStats {
  totalPayments: number;
  pendingPayments: number;
  paidPayments: number;
  overduePayments: number;
  cancelledPayments: number;
  refundedPayments: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
}

// Для фильтрации платежей (соответствует API параметрам)
export interface PaymentFilters {
  organizationId: string;
  groupId?: string;
  status?: number;
  type?: number;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}

// Ответ от API для списка платежей (соответствует реальному API)
export interface PaymentsResponse {
  items: Payment[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Для создания нового платежа (соответствует API)
export interface CreatePaymentRequest {
  studentId: string;
  groupId: string;
  paymentPeriod: string;
  type: number;
  originalAmount: number;
  discountPercentage?: number;
  discountReason?: string;
  periodStart: string;
  periodEnd: string;
}