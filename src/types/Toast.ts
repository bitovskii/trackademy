export interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
  duration?: number; // в миллисекундах, по умолчанию 20000 (20 сек)
}

export type ToastType = 'success' | 'error';