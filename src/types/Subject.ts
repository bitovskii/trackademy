export interface Subject {
  id: string;
  name: string;
  description: string;
  price: number;
  paymentType: number;
  organizationId: string;
}

export interface SubjectFormData {
  name: string;
  description: string;
  price: number;
  paymentType: number;
  [key: string]: unknown;
}

export const PaymentType = {
  Monthly: 1,
  OneTime: 2
} as const;

export const getPaymentTypeLabel = (type: number): string => {
  switch (type) {
    case PaymentType.Monthly:
      return 'Ежемесячный';
    case PaymentType.OneTime:
      return 'Единоразовый';
    default:
      return 'Не указан';
  }
};