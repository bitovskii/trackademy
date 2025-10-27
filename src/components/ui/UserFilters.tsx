'use client';

import React, { useState } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { MultiSelect } from './MultiSelect';

interface UserFiltersProps {
  onFilterChange: (filters: UserFilters) => void;
  groups: Group[];
  isLoading?: boolean;
}

export interface UserFilters {
  search: string;
  roleIds: number[];
  groupIds: string[];
}

interface Group {
  id: string;
  name: string;
}

const roleOptions = [
  { 
    id: 1, 
    name: 'Студент', 
    icon: '🎓',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
  },
  { 
    id: 3, 
    name: 'Преподаватель', 
    icon: '👨‍🏫',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' 
  }
];

export const UserFilters: React.FC<UserFiltersProps> = ({
  onFilterChange,
  groups,
  isLoading = false
}) => {
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    roleIds: [],
    groupIds: []
  });

  const handleSearchChange = (value: string) => {
    const newFilters = { ...filters, search: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleRoleChange = (roleIdStrings: string[]) => {
    const roleIds = roleIdStrings.map(id => parseInt(id, 10));
    const newFilters = { ...filters, roleIds };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleGroupChange = (groupIds: string[]) => {
    const newFilters = { ...filters, groupIds };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    const newFilters = { search: '', roleIds: [], groupIds: [] };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const hasActiveFilters = filters.search || filters.roleIds.length > 0 || filters.groupIds.length > 0;

  // Преобразуем роли для MultiSelect
  const roleOptionsForMultiSelect = roleOptions.map(role => ({
    id: role.id.toString(),
    name: role.name
  }));

  const selectedRoleIds = filters.roleIds.map(id => id.toString());

  return (
    <div className="border-b border-gray-200 pb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <FunnelIcon className="h-5 w-5 text-gray-500" />
          <h3 className="text-md font-medium text-gray-900">Фильтры</h3>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              {filters.roleIds.length + filters.groupIds.length + (filters.search ? 1 : 0)}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Очистить всё
            </button>
          )}
        </div>
      </div>

      {/* Search Field */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Поиск по имени или логину..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-md text-gray-900 
                   placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                   text-sm"
        />
        {filters.search && (
          <button
            onClick={() => handleSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <XMarkIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Роль
            </label>
            <MultiSelect
              options={roleOptionsForMultiSelect}
              selectedValues={selectedRoleIds}
              onChange={handleRoleChange}
              placeholder="Выберите роли..."
              maxHeight="240px"
            />
          </div>

          {/* Group Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Группы
            </label>
            <MultiSelect
              options={groups}
              selectedValues={filters.groupIds}
              onChange={handleGroupChange}
              placeholder={groups.length > 0 ? "Выберите группы..." : "Группы не найдены"}
              maxHeight="240px"
            />
          </div>
        </div>
      </div>
    </div>
  );
};