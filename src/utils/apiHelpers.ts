// Utility functions for API error handling and toast notifications

export const handleApiError = async (response: Response): Promise<never> => {
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
    errorMessage = 'Ошибка аутентификации. Пожалуйста, войдите в систему заново.';
  } else if (response.status === 403) {
    errorMessage = 'Недостаточно прав для выполнения этой операции.';
  } else if (response.status === 404) {
    errorMessage = 'Запрашиваемый ресурс не найден.';
  } else if (response.status === 500) {
    errorMessage = 'Внутренняя ошибка сервера. Попробуйте позже.';
  }
  
  throw new Error(errorMessage);
};

export const getSuccessMessage = (action: string, entity?: string): string => {
  const entityText = entity || 'элемент';
  
  switch (action) {
    case 'create':
      return `${entityText} успешно создан`;
    case 'update':
      return `${entityText} успешно обновлен`;
    case 'delete':
      return `${entityText} успешно удален`;
    case 'save':
      return `${entityText} успешно сохранен`;
    default:
      return 'Операция выполнена успешно';
  }
};