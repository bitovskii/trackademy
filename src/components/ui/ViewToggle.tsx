import React from 'react';
import { 
  TableCellsIcon, 
  CalendarDaysIcon, 
  ViewColumnsIcon,
  Squares2X2Icon 
} from '@heroicons/react/24/outline';

export type ViewMode = 'table' | 'day' | 'week' | 'month';

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ 
  currentView, 
  onViewChange 
}) => {
  const views = [
    { 
      key: 'table' as ViewMode, 
      label: 'Таблица', 
      icon: TableCellsIcon,
      description: 'Табличное представление'
    },
    { 
      key: 'day' as ViewMode, 
      label: 'День', 
      icon: CalendarDaysIcon,
      description: 'Календарь на день'
    },
    { 
      key: 'week' as ViewMode, 
      label: 'Неделя', 
      icon: ViewColumnsIcon,
      description: 'Календарь на неделю'
    },
    { 
      key: 'month' as ViewMode, 
      label: 'Месяц', 
      icon: Squares2X2Icon,
      description: 'Календарь на месяц'
    }
  ];

  return (
    <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
      {views.map((view) => {
        const Icon = view.icon;
        const isActive = currentView === view.key;
        
        return (
          <button
            key={view.key}
            onClick={() => onViewChange(view.key)}
            title={view.description}
            className={`
              flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
              ${isActive 
                ? 'bg-white dark:bg-gray-600 text-violet-600 dark:text-violet-400 shadow-sm' 
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-600'
              }
            `}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{view.label}</span>
          </button>
        );
      })}
    </div>
  );
};