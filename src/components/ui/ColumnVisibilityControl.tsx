'use client';

import React, { useState, useRef, useEffect } from 'react';
import { EyeIcon, EyeSlashIcon, ChevronDownIcon, ViewColumnsIcon } from '@heroicons/react/24/outline';
import { createPortal } from 'react-dom';

export interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
  required?: boolean; // Обязательные колонки нельзя скрыть
}

interface ColumnVisibilityControlProps {
  columns: ColumnConfig[];
  onColumnToggle: (columnKey: string) => void;
  className?: string;
  variant?: 'default' | 'header'; // Новый вариант для заголовка
}

export const ColumnVisibilityControl: React.FC<ColumnVisibilityControlProps> = ({
  columns,
  onColumnToggle,
  className = '',
  variant = 'default'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right
      });
    }
  }, [isOpen]);

  const visibleCount = columns.filter(col => col.visible).length;
  const totalCount = columns.length;

  // Стили для разных вариантов
  const buttonStyles = variant === 'header' 
    ? "group relative bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/30 hover:scale-105 shadow-lg flex items-center"
    : "inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors";

  const iconColor = variant === 'header' ? "h-4 w-4 mr-2 text-white group-hover:text-white/90" : "h-4 w-4 mr-2";

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={buttonStyles}
        data-dropdown-trigger
      >
        <ViewColumnsIcon className={iconColor} />
        {variant === 'header' ? 'Колонки' : `Колонки (${visibleCount}/${totalCount})`}
        <ChevronDownIcon 
          className={`h-4 w-4 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${variant === 'header' ? 'text-white group-hover:text-white/90' : ''}`} 
        />
      </button>

      {isOpen && typeof window !== 'undefined' && createPortal(
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[9998]" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div 
            className="fixed w-72 bg-white dark:bg-gray-700 rounded-xl shadow-xl 
                       border border-gray-200 dark:border-gray-600 z-[9999] ring-1 ring-black ring-opacity-5 overflow-hidden"
            style={{
              top: `${dropdownPosition.top}px`,
              right: `${dropdownPosition.right}px`
            }}
          >
            <div className="p-4">
              <div className="flex items-center mb-4">
                <ViewColumnsIcon className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  Видимость колонок
                </div>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {columns.map((column) => (
                  <label
                    key={column.key}
                    className={`flex items-center p-3 rounded-lg transition-colors cursor-pointer
                               ${column.required 
                                 ? 'opacity-75 cursor-not-allowed bg-gray-50 dark:bg-gray-600/50' 
                                 : 'hover:bg-gray-50 dark:hover:bg-gray-600 hover:shadow-sm'
                               }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={column.visible}
                        onChange={() => !column.required && onColumnToggle(column.key)}
                        disabled={column.required}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 
                                   rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      />
                      <div className="ml-3 flex items-center">
                        {column.visible ? (
                          <EyeIcon className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <EyeSlashIcon className="h-4 w-4 text-gray-400 mr-2" />
                        )}
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {column.label}
                        </span>
                        {column.required && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                            обязательная
                          </span>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      columns.forEach(col => {
                        if (!col.required && !col.visible) {
                          onColumnToggle(col.key);
                        }
                      });
                    }}
                    className="flex-1 px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 
                               text-white rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                  >
                    Показать все
                  </button>
                  <button
                    onClick={() => {
                      columns.forEach(col => {
                        if (!col.required && col.visible) {
                          onColumnToggle(col.key);
                        }
                      });
                    }}
                    className="flex-1 px-4 py-2 text-sm bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 
                               text-white rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                  >
                    Скрыть все
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

// Хук для управления видимостью колонок
export const useColumnVisibility = (initialColumns: Omit<ColumnConfig, 'visible'>[]) => {
  const [columns, setColumns] = useState<ColumnConfig[]>(() =>
    initialColumns.map(col => ({ ...col, visible: true }))
  );

  const toggleColumn = (columnKey: string) => {
    setColumns(prev =>
      prev.map(col =>
        col.key === columnKey ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const getVisibleColumns = () => columns.filter(col => col.visible);

  const isColumnVisible = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey);
    return column?.visible ?? false;
  };

  return {
    columns,
    toggleColumn,
    getVisibleColumns,
    isColumnVisible
  };
};