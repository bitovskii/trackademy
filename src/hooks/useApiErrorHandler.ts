// Глобальный обработчик API ошибок с Toast уведомлениями
'use client';

import { useToast } from '@/contexts/ToastContext';

export function useApiErrorHandler() {
  const { showError } = useToast();

  const handleApiError = async (response: Response): Promise<never> => {
    let errorMessage;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.title || errorData.error || `Ошибка ${response.status}: ${response.statusText}`;
    } catch {
      // Если не удалось распарсить JSON
      errorMessage = `Ошибка ${response.status}: ${response.statusText}`;
    }
    
    // Специальные сообщения для часто встречающихся ошибок
    if (response.status === 401) {
      errorMessage = 'Сессия истекла. Пожалуйста, войдите в систему заново.';
    } else if (response.status === 403) {
      errorMessage = 'У вас нет прав доступа к этой странице. Обратитесь к администратору.';
    } else if (response.status === 404) {
      errorMessage = 'Запрашиваемый ресурс не найден.';
    } else if (response.status === 500) {
      errorMessage = 'Внутренняя ошибка сервера. Попробуйте позже.';
    }
    
    // Показываем ошибку в toast
    showError(errorMessage);
    
    throw new Error(errorMessage);
  };

  return { handleApiError };
}