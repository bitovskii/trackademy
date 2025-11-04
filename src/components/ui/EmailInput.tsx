'use client';

import React, { useState, useEffect } from 'react';
import { useEmailValidator } from '../../hooks/useEmailValidator';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  name?: string;
  showSuggestions?: boolean;
}

export const EmailInput: React.FC<EmailInputProps> = ({
  value,
  onChange,
  onBlur,
  placeholder = "example@domain.com",
  required = false,
  error,
  disabled = false,
  className = "",
  label,
  name,
  showSuggestions = true
}) => {
  const { 
    validateEmail, 
    formatEmailDisplay, 
    isValidEmailDomain,
    suggestEmailCorrection 
  } = useEmailValidator();
  
  const [localValue, setLocalValue] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  // const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formatted = formatEmailDisplay(inputValue);
    setLocalValue(formatted);
    onChange(formatted);

    // Показываем предложения только если есть @ но домен кажется неправильным
    if (showSuggestions && formatted.includes('@') && !isValidEmailDomain(formatted)) {
      const emailSuggestions = suggestEmailCorrection(formatted);
      setSuggestions(emailSuggestions);
      setShowSuggestionsList(emailSuggestions.length > 0);
    } else {
      setShowSuggestionsList(false);
    }
  };

  const handleFocus = () => {
    // setIsFocused(true);
  };

  const handleBlurInternal = () => {
    // setIsFocused(false);
    // Задержка чтобы клик по предложению сработал
    setTimeout(() => {
      setShowSuggestionsList(false);
    }, 200);
    onBlur?.();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setLocalValue(suggestion);
    onChange(suggestion);
    setShowSuggestionsList(false);
  };

  const isValid = localValue && validateEmail(localValue);
  const hasError = error || (localValue && !validateEmail(localValue));

  const baseClasses = `
    w-full px-4 py-3 border rounded-xl 
    focus:outline-none focus:ring-2 focus:border-transparent 
    transition-all duration-200 text-gray-900 dark:text-white
    placeholder:text-gray-400 dark:placeholder:text-gray-500
    ${hasError
      ? 'border-red-400 bg-red-50 dark:bg-red-900/20 focus:ring-red-500' 
      : isValid
      ? 'border-green-400 bg-green-50 dark:bg-green-900/20 focus:ring-green-500'
      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-blue-500'
    }
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
  `;

  return (
    <div className="space-y-2 relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          type="email"
          name={name}
          value={localValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlurInternal}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`${baseClasses} ${className} pr-10`}
          autoComplete="email"
          spellCheck={false}
        />
        
        {/* Индикатор валидности */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isValid && (
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
          )}
          {hasError && (
            <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
          )}
        </div>
      </div>

      {/* Предложения исправлений */}
      {showSuggestionsList && suggestions.length > 0 && (
        <div className="absolute z-50 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg mt-1">
          <div className="p-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Возможно, вы имели в виду:
            </p>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
          <ExclamationCircleIcon className="w-4 h-4" />
          <span>{error}</span>
        </p>
      )}
      
      {localValue && !error && !isValid && (
        <p className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
          <ExclamationCircleIcon className="w-4 h-4" />
          <span>Введите корректный email адрес</span>
        </p>
      )}
      
      {isValid && !error && (
        <p className="text-xs text-green-600 dark:text-green-400">
          ✓ Email адрес корректен
        </p>
      )}
    </div>
  );
};