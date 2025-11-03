import React, { useState } from 'react';
import { FunnelIcon } from '@heroicons/react/24/outline';
import { MultiSelect } from '../ui/MultiSelect';
import { DashboardFilters } from '../../types/Dashboard';

interface DashboardFiltersProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
  groups: Array<{ id: string; name: string }>;
  subjects: Array<{ id: string; name: string }>;
  isLoading?: boolean;
}

export const DashboardFiltersComponent: React.FC<DashboardFiltersProps> = ({
  filters,
  onFiltersChange,
  groups,
  subjects,
  isLoading = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleGroupChange = (groupIds: string[]) => {
    onFiltersChange({
      ...filters,
      groupIds: groupIds.length > 0 ? groupIds : undefined
    });
  };

  const handleSubjectChange = (subjectIds: string[]) => {
    onFiltersChange({
      ...filters,
      subjectIds: subjectIds.length > 0 ? subjectIds : undefined
    });
  };

  const handleToggleChange = (field: 'includeInactiveStudents', value: boolean) => {
    onFiltersChange({
      ...filters,
      [field]: value
    });
  };

  const handleThresholdChange = (value: string) => {
    const numValue = parseFloat(value);
    onFiltersChange({
      ...filters,
      lowPerformanceThreshold: isNaN(numValue) ? undefined : numValue
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      organizationId: filters.organizationId,
      groupIds: undefined,
      subjectIds: undefined,
      includeInactiveStudents: undefined,
      lowPerformanceThreshold: undefined
    });
  };

  const hasActiveFilters = 
    (filters.groupIds && filters.groupIds.length > 0) ||
    (filters.subjectIds && filters.subjectIds.length > 0) ||
    filters.includeInactiveStudents !== undefined ||
    filters.lowPerformanceThreshold !== undefined;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FunnelIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Фильтры дашборда</h3>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 rounded-full">
              {(filters.groupIds?.length || 0) + (filters.subjectIds?.length || 0) + 
               (filters.includeInactiveStudents !== undefined ? 1 : 0) + 
               (filters.lowPerformanceThreshold !== undefined ? 1 : 0)}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              Очистить всё
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            {isExpanded ? 'Скрыть' : 'Показать'} фильтры
          </button>
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Groups */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Группы
              </label>
              <MultiSelect
                options={groups}
                selectedValues={filters.groupIds || []}
                onChange={handleGroupChange}
                placeholder="Выберите группы..."
                disabled={false}
              />
            </div>

            {/* Subjects */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Предметы
              </label>
              <MultiSelect
                options={subjects}
                selectedValues={filters.subjectIds || []}
                onChange={handleSubjectChange}
                placeholder="Выберите предметы..."
                disabled={false}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Include Inactive Students */}
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.includeInactiveStudents || false}
                  onChange={(e) => handleToggleChange('includeInactiveStudents', e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Включить неактивных студентов
                </span>
              </label>
            </div>

            {/* Low Performance Threshold */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Порог низкой успеваемости (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={filters.lowPerformanceThreshold || ''}
                onChange={(e) => handleThresholdChange(e.target.value)}
                placeholder="Например, 60"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         text-gray-900 dark:text-white bg-white dark:bg-gray-700
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
            <span>Обновление данных...</span>
          </div>
        </div>
      )}
    </div>
  );
};