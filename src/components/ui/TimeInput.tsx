'use client';

import React, { useState, useRef, useEffect } from 'react';

interface TimeInputProps {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  'data-field'?: string;
}

export const TimeInput: React.FC<TimeInputProps> = ({
  value,
  onChange,
  placeholder = "ЧЧ:ММ",
  className = "",
  required = false,
  disabled = false,
  error,
  'data-field': dataField
}) => {
  const [displayValue, setDisplayValue] = useState(value || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDisplayValue(value || '');
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value.replace(/[^\d:]/g, ''); // Только цифры и двоеточие
    
    // Удаляем лишние двоеточия
    newValue = newValue.replace(/:{2,}/g, ':');
    
    // Ограничиваем длину
    if (newValue.length > 5) {
      newValue = newValue.substring(0, 5);
    }

    // Автоматическое добавление двоеточия после двух цифр
    if (newValue.length === 2 && !newValue.includes(':')) {
      newValue += ':';
    }

    // Проверяем корректность часов и минут
    const parts = newValue.split(':');
    if (parts.length > 0) {
      const hours = parseInt(parts[0]);
      if (hours > 23) {
        parts[0] = '23';
      }
    }
    if (parts.length > 1) {
      const minutes = parseInt(parts[1]);
      if (minutes > 59) {
        parts[1] = '59';
      }
    }
    
    newValue = parts.join(':');
    setDisplayValue(newValue);

    // Автопереход курсора на минуты после ввода часов
    if (newValue.length === 3 && newValue.includes(':') && inputRef.current) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(3, 5);
        }
      }, 0);
    }

    // Отправляем значение наверх (пустую строку как null)
    const valueToSend = newValue.trim() === '' ? null : newValue;
    onChange(valueToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { key, target } = e;
    const input = target as HTMLInputElement;
    const { selectionStart, selectionEnd } = input;

    // Разрешаем навигационные клавиши
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Tab', 'Delete', 'Backspace'].includes(key)) {
      return;
    }

    // Разрешаем Ctrl+A, Ctrl+C, Ctrl+V, etc.
    if (e.ctrlKey || e.metaKey) {
      return;
    }

    // Разрешаем только цифры
    if (!/\d/.test(key)) {
      e.preventDefault();
      return;
    }

    // Автопереход на минуты после ввода второй цифры часов
    if (selectionStart === 2 && displayValue.length === 2) {
      e.preventDefault();
      const newValue = displayValue + ':' + key;
      setDisplayValue(newValue);
      onChange(newValue);
      
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(4, 4);
        }
      }, 0);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // При фокусе, если поле пустое, устанавливаем курсор в начало
    if (displayValue === '') {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(0, 0);
        }
      }, 0);
    }
  };

  const handleBlur = () => {
    // При потере фокуса, если введено неполное время, очищаем поле
    if (displayValue.length > 0 && displayValue.length < 5) {
      if (!displayValue.match(/^\d{2}:\d{2}$/)) {
        setDisplayValue('');
        onChange(null);
      }
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        data-field={dataField}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors duration-200 ${
          error 
            ? 'border-red-500 dark:border-red-400' 
            : 'border-gray-300 dark:border-gray-600'
        } ${
          disabled 
            ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' 
            : 'bg-white dark:bg-gray-700'
        } text-gray-900 dark:text-white ${className}`}
        disabled={disabled}
        required={required}
        maxLength={5}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};