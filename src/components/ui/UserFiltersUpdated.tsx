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

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearchChange = (value: string) => {
    const newFilters = { ...filters, search: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleRoleChange = (selectedRoles: number[]) => {
    const newFilters = { ...filters, roleIds: selectedRoles };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleGroupChange = (selectedGroups: string[]) => {
    const newFilters = { ...filters, groupIds: selectedGroups };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const newFilters = {
      search: '',
      roleIds: [],
      groupIds: []
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
    setShowAdvanced(false);
  };

  const hasActiveFilters = filters.search || filters.roleIds.length > 0 || filters.groupIds.length > 0;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        </div>
        <input
          type="text"
          placeholder="Поиск пользователей..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 
                   rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                   placeholder-gray-500 dark:placeholder-gray-400 
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   shadow-sm hover:shadow-md transition-all duration-200"
          disabled={isLoading}
        />
      </div>

      {/* Filter Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 
                   text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 
                   transition-colors duration-200 shadow-sm"
        >
          <FunnelIcon className="h-4 w-4 mr-2" />
          Фильтры
          {hasActiveFilters && (
            <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-medium 
                           bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-full">
              {(filters.roleIds.length + filters.groupIds.length) || ''}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 
                     hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <XMarkIcon className="h-4 w-4 mr-1" />
            Очистить
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Роли
            </label>
            <MultiSelect
              options={roleOptions.map(role => ({ 
                id: role.id.toString(), 
                name: role.name
              }))}
              selectedValues={filters.roleIds.map(id => id.toString())}
              onChange={(values) => handleRoleChange(values.map(v => parseInt(v)))}
              placeholder="Выберите роли..."
              disabled={isLoading}
            />
          </div>

          {/* Group Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Группы
            </label>
            <MultiSelect
              options={groups.map(group => ({ 
                id: group.id, 
                name: group.name
              }))}
              selectedValues={filters.groupIds}
              onChange={handleGroupChange}
              placeholder="Выберите группы..."
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm 
                           bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">
              Поиск: &quot;{filters.search}&quot;
              <button
                onClick={() => handleSearchChange('')}
                className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          )}
          
          {filters.roleIds.map(roleId => {
            const role = roleOptions.find(r => r.id === roleId);
            return role ? (
              <span key={roleId} className="inline-flex items-center px-3 py-1 rounded-full text-sm 
                                         bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300">
                {role.icon} {role.name}
                <button
                  onClick={() => handleRoleChange(filters.roleIds.filter(id => id !== roleId))}
                  className="ml-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            ) : null;
          })}
          
          {filters.groupIds.map(groupId => {
            const group = groups.find(g => g.id === groupId);
            return group ? (
              <span key={groupId} className="inline-flex items-center px-3 py-1 rounded-full text-sm 
                                          bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300">
                👥 {group.name}
                <button
                  onClick={() => handleGroupChange(filters.groupIds.filter(id => id !== groupId))}
                  className="ml-2 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
};