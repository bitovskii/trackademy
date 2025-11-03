'use client';

import React from 'react';

interface DaysOfWeekSelectorProps {
  value: number[]; // Массив индексов дней недели (0 = понедельник, 6 = воскресенье)
  onChange: (value: number[]) => void;
  error?: string;
  className?: string;
  disabled?: boolean;
}

const DAYS_OF_WEEK = [
  { value: 1, label: 'Пн', fullLabel: 'Понедельник' },
  { value: 2, label: 'Вт', fullLabel: 'Вторник' },
  { value: 3, label: 'Ср', fullLabel: 'Среда' },
  { value: 4, label: 'Чт', fullLabel: 'Четверг' },
  { value: 5, label: 'Пт', fullLabel: 'Пятница' },
  { value: 6, label: 'Сб', fullLabel: 'Суббота' },
  { value: 7, label: 'Вс', fullLabel: 'Воскресенье' }
];

export const DaysOfWeekSelector: React.FC<DaysOfWeekSelectorProps> = ({
  value,
  onChange,
  error,
  className = "",
  disabled = false
}) => {
  const handleDayToggle = (dayValue: number) => {
    if (disabled) return;

    const newValue = value.includes(dayValue)
      ? value.filter(day => day !== dayValue)
      : [...value, dayValue].sort((a, b) => a - b);
    
    onChange(newValue);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-wrap gap-2">
        {DAYS_OF_WEEK.map((day) => {
          const isSelected = value.includes(day.value);
          return (
            <button
              key={day.value}
              type="button"
              onClick={() => handleDayToggle(day.value)}
              disabled={disabled}
              title={day.fullLabel}
              className={`
                px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 min-w-[40px]
                ${disabled 
                  ? 'cursor-not-allowed opacity-50' 
                  : 'cursor-pointer hover:scale-105'
                }
                ${isSelected
                  ? 'bg-violet-600 text-white shadow-md border-2 border-violet-600 dark:bg-violet-500 dark:border-violet-500'
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-violet-300 hover:bg-violet-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:border-violet-400 dark:hover:bg-gray-600'
                }
                ${error 
                  ? 'border-red-500 dark:border-red-400' 
                  : ''
                }
              `}
            >
              {day.label}
            </button>
          );
        })}
      </div>
      
      {/* Показываем выбранные дни в виде текста */}
      {value.length > 0 && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Выбрано: {value.map(dayValue => DAYS_OF_WEEK.find(d => d.value === dayValue)?.label).join(', ')}
        </div>
      )}
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};