import React from 'react';

interface DaysOfWeekDisplayProps {
  daysOfWeek: number[];
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'badges' | 'compact';
}

export const DaysOfWeekDisplay: React.FC<DaysOfWeekDisplayProps> = ({ 
  daysOfWeek, 
  size = 'sm',
  variant = 'badges'
}) => {
  const dayNames = {
    1: { short: 'ПН', full: 'Понедельник', veryShort: 'П' },
    2: { short: 'ВТ', full: 'Вторник', veryShort: 'В' },
    3: { short: 'СР', full: 'Среда', veryShort: 'С' },
    4: { short: 'ЧТ', full: 'Четверг', veryShort: 'Ч' },
    5: { short: 'ПТ', full: 'Пятница', veryShort: 'П' },
    6: { short: 'СБ', full: 'Суббота', veryShort: 'С' },
    7: { short: 'ВС', full: 'Воскресенье', veryShort: 'В' }
  };

  const allDays = [1, 2, 3, 4, 5, 6, 7];
  
  const sizeClasses = {
    xs: 'px-1 py-0.5 text-xs min-w-[24px]',
    sm: 'px-1.5 py-0.5 text-xs min-w-[28px]',
    md: 'px-2 py-1 text-sm min-w-[32px]',
    lg: 'px-3 py-1.5 text-base min-w-[36px]'
  };

  // Compact variant - show as text
  if (variant === 'compact') {
    const activeDays = daysOfWeek
      .sort((a, b) => a - b)
      .map(day => dayNames[day as keyof typeof dayNames]?.short)
      .filter(Boolean)
      .join(', ');
    
    return (
      <span className="text-sm text-gray-700 dark:text-gray-300">
        {activeDays || 'Не указано'}
      </span>
    );
  }

  // Badge variant - show as colored badges
  return (
    <div className="flex flex-wrap gap-1">
      {allDays.map(day => {
        const isActive = daysOfWeek.includes(day);
        const dayInfo = dayNames[day as keyof typeof dayNames];
        
        return (
          <span
            key={day}
            title={dayInfo.full}
            className={`
              ${sizeClasses[size]}
              rounded-md font-medium text-center inline-flex items-center justify-center
              transition-colors duration-200
              ${isActive 
                ? 'bg-violet-100 text-violet-800 border border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700' 
                : 'bg-gray-100 text-gray-400 border border-gray-200 dark:bg-gray-700 dark:text-gray-500 dark:border-gray-600'
              }
            `}
          >
            {size === 'xs' ? dayInfo.veryShort : dayInfo.short}
          </span>
        );
      })}
    </div>
  );
};