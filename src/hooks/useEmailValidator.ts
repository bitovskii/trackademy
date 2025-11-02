'use client';

import { useCallback } from 'react';

export const useEmailValidator = () => {
  // Регулярное выражение для валидации email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const validateEmail = useCallback((email: string): boolean => {
    if (!email.trim()) return false;
    return emailRegex.test(email.trim().toLowerCase());
  }, []);

  const formatEmailDisplay = useCallback((email: string): string => {
    // Убираем пробелы в начале и конце, приводим к нижнему регистру
    return email.trim().toLowerCase();
  }, []);

  const getEmailError = useCallback((email: string): string => {
    if (!email.trim()) {
      return 'Email обязателен';
    }
    
    if (!validateEmail(email)) {
      return 'Введите корректный email адрес';
    }
    
    return '';
  }, [validateEmail]);

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // Автоматически форматируем при вводе
    const value = e.target.value;
    const formatted = formatEmailDisplay(value);
    
    // Обновляем значение в поле
    e.target.value = formatted;
    
    return formatted;
  }, [formatEmailDisplay]);

  const isValidEmailDomain = useCallback((email: string): boolean => {
    const commonDomains = [
      '@gmail.com', '@yandex.ru', '@yandex.com', '@mail.ru', 
      '@outlook.com', '@hotmail.com', '@yahoo.com', '@icloud.com'
    ];
    
    const lowercaseEmail = email.toLowerCase();
    return commonDomains.some(domain => lowercaseEmail.includes(domain));
  }, []);

  const suggestEmailCorrection = useCallback((email: string): string[] => {
    const suggestions: string[] = [];
    const [localPart] = email.split('@');
    
    if (!localPart) return suggestions;
    
    // Предложения исправлений для популярных доменов
    const domainSuggestions = [
      'gmail.com', 'yandex.ru', 'mail.ru', 'outlook.com', 'hotmail.com'
    ];
    
    domainSuggestions.forEach(domain => {
      suggestions.push(`${localPart}@${domain}`);
    });
    
    return suggestions.slice(0, 3); // Максимум 3 предложения
  }, []);

  return {
    validateEmail,
    formatEmailDisplay,
    getEmailError,
    handleEmailChange,
    isValidEmailDomain,
    suggestEmailCorrection,
  };
};