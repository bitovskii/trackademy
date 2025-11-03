import { useToast } from '../contexts/ToastContext';

export interface ApiToastOptions {
  successMessage?: string;
  errorMessage?: string;
  showSuccess?: boolean;
  showError?: boolean;
}

export const useApiToast = () => {
  const { showSuccess, showError } = useToast();

  const handleApiOperation = async <T>(
    operation: () => Promise<T>,
    options: ApiToastOptions = {}
  ): Promise<{ success: boolean; data?: T }> => {
    const {
      successMessage,
      errorMessage,
      showSuccess: shouldShowSuccess = true,
      showError: shouldShowError = true
    } = options;

    try {
      const result = await operation();
      
      if (shouldShowSuccess && successMessage) {
        showSuccess(successMessage);
      }
      
      return { success: true, data: result };
    } catch (error: any) {
      if (shouldShowError) {
        // Извлекаем сообщение об ошибке из API ответа
        let message = errorMessage || 'Произошла ошибка';
        
        // Попробуем извлечь понятное сообщение из разных форматов ошибки
        if (error?.parsedError?.error) {
          // Структурированная ошибка из нашего API сервиса
          message = error.parsedError.error;
        } else if (error?.response?.data?.error) {
          // Axios формат
          message = error.response.data.error;
        } else if (error?.response?.data?.message) {
          // Альтернативный Axios формат
          message = error.response.data.message;
        } else if (error?.message && !error.message.startsWith('HTTP error!')) {
          // Простое сообщение об ошибке (но не техническое HTTP сообщение)
          message = error.message;
        }
        
        showError(message);
      }
      
      return { success: false };
    }
  };

  // Готовые методы для CRUD операций
  const createOperation = async <T>(
    operation: () => Promise<T>,
    entityName: string = 'данные'
  ) => {
    return handleApiOperation(operation, {
      successMessage: `${entityName} успешно созданы`,
      errorMessage: `Не удалось создать ${entityName.toLowerCase()}`
    });
  };

  const updateOperation = async <T>(
    operation: () => Promise<T>,
    entityName: string = 'данные'
  ) => {
    return handleApiOperation(operation, {
      successMessage: `${entityName} успешно обновлены`,
      errorMessage: `Не удалось обновить ${entityName.toLowerCase()}`
    });
  };

  const deleteOperation = async <T>(
    operation: () => Promise<T>,
    entityName: string = 'данные'
  ) => {
    return handleApiOperation(operation, {
      successMessage: `${entityName} успешно удалены`,
      errorMessage: `Не удалось удалить ${entityName.toLowerCase()}`
    });
  };

  const loadOperation = async <T>(
    operation: () => Promise<T>,
    entityName: string = 'данные'
  ) => {
    const result = await handleApiOperation(operation, {
      showSuccess: false, // Обычно не показываем успех для загрузки
      errorMessage: `Не удалось загрузить ${entityName.toLowerCase()}`
    });
    
    if (result.success) {
      return result.data!;
    } else {
      throw new Error(`Не удалось загрузить ${entityName.toLowerCase()}`);
    }
  };

  return {
    handleApiOperation,
    createOperation,
    updateOperation,
    deleteOperation,
    loadOperation
  };
};