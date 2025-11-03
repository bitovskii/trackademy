'use client';

import React, { useState } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { MultiSelect } from './MultiSelect';

interface UserFiltersProps {
  onFilterChange: (filters: UserFilters) => void;
  groups: Group[];
  isLoading?: boolean; // Только для информации, не блокирует UI
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

  // Отдельное состояние для поля поиска, чтобы оно не зависало
  const [searchValue, setSearchValue] = useState('');
  
  // Отдельное состояние для индикации поиска
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchChange = (value: string) => {
    // Мгновенно обновляем состояние поля ввода (ВСЕГДА доступно)
    setSearchValue(value);
    
    // Показываем индикатор набора текста только при изменении
    if (value !== filters.search) {
      setIsSearching(true);
      // Скрываем индикатор через короткое время
      setTimeout(() => setIsSearching(false), 300);
    }
    
    // Обновляем фильтры для API (НЕ блокируем UI)
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
    setSearchValue(''); // Очищаем также локальное состояние поиска
    setIsSearching(false); // Останавливаем индикатор поиска
    onFilterChange(newFilters);
  };

  const hasActiveFilters = searchValue || filters.roleIds.length > 0 || filters.groupIds.length > 0;

  // Преобразуем роли для MultiSelect
  const roleOptionsForMultiSelect = roleOptions.map(role => ({
    id: role.id.toString(),
    name: role.name
  }));

  const selectedRoleIds = filters.roleIds.map(id => id.toString());

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <FunnelIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <h3 className="text-md font-medium text-gray-900 dark:text-white">Фильтры</h3>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 rounded-full">
              {filters.roleIds.length + filters.groupIds.length + (searchValue ? 1 : 0)}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              Очистить всё
            </button>
          )}
        </div>
      </div>

      {/* Search Field - ВСЕГДА активно */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isSearching ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
          ) : (
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          )}
        </div>
        <input
          type="text"
          placeholder="Поиск по имени или логину..."
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          onInput={(e) => {
            // Мгновенная обработка для максимальной отзывчивости
            const target = e.target as HTMLInputElement;
            setSearchValue(target.value);
          }}
          disabled={false} // НИКОГДА не блокируется
          autoComplete="off"
          spellCheck={false}
          className="block w-full pl-10 pr-16 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md 
                   text-gray-900 dark:text-white bg-white dark:bg-gray-800
                   placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 
                   focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200
                   hover:border-gray-400 dark:hover:border-gray-500"
          style={{ 
            WebkitAppearance: 'none',
            MozAppearance: 'textfield'
          }}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
          {/* Показываем статус только локального ввода, НЕ API загрузки */}
          {isSearching && (
            <div className="text-xs text-green-600 dark:text-green-400 font-medium">
              Ввод...
            </div>
          )}
          {/* Показываем статус API загрузки отдельно, но НЕ блокируем поле */}
          {isLoading && !isSearching && (
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium opacity-75">
              Загрузка таблицы...
            </div>
          )}
          {searchValue && (
            <button
              onClick={() => handleSearchChange('')}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Очистить поиск"
            >
              <XMarkIcon className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
            </button>
          )}
        </div>
      </div>

      {/* Filters - ВСЕГДА доступны */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Роль
            </label>
            <MultiSelect
              options={roleOptionsForMultiSelect}
              selectedValues={selectedRoleIds}
              onChange={handleRoleChange}
              placeholder="Выберите роли..."
              maxHeight="240px"
              disabled={false} // НИКОГДА не блокируется
            />
          </div>

          {/* Group Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Группы
              {isLoading && (
                <span className="ml-2 text-xs text-blue-600 dark:text-blue-400 opacity-75">
                  (обновление таблицы...)
                </span>
              )}
            </label>
            <MultiSelect
              options={groups}
              selectedValues={filters.groupIds}
              onChange={handleGroupChange}
              placeholder={groups.length > 0 ? "Выберите группы..." : "Группы не найдены"}
              maxHeight="240px"
              disabled={false} // НИКОГДА не блокируется
            />
          </div>
        </div>
      </div>
    </div>
  );
};