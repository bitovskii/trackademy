'use client';

import React from 'react';
import { UserIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { User } from '../../types/User';
import { canManageUsers } from '../../types/Role';
import { useColumnVisibility, ColumnVisibilityControl } from './ColumnVisibilityControl';

interface UsersTableProps {
  users: User[];
  isLoading: boolean;
  currentUser?: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  showColumnControls?: boolean;
  columnVisibility?: (columnKey: string) => boolean;
  currentPage?: number;
  itemsPerPage?: number;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  isLoading,
  currentUser,
  onEdit,
  onDelete,
  showColumnControls = true,
  columnVisibility,
  currentPage = 1,
  itemsPerPage = 10
}) => {
  // Конфигурация колонок - используется только если нет внешнего управления
  const { columns, toggleColumn, isColumnVisible: internalIsColumnVisible } = useColumnVisibility([
    { key: 'number', label: '#', required: true },
    { key: 'user', label: 'Пользователь', required: true },
    { key: 'contacts', label: 'Контакты' },
    { key: 'role', label: 'Роль' },
    { key: 'group', label: 'Группа' },
    { key: 'actions', label: 'Действия', required: !!(currentUser && canManageUsers(currentUser.role)) }
  ]);

  // Используем внешнюю функцию видимости колонок если предоставлена, иначе внутреннюю
  const isColumnVisible = columnVisibility || internalIsColumnVisible;
  const getRoleText = (role: number) => {
    switch (role) {
      case 1: return 'Студент';
      case 2: return 'Администратор';
      case 3: return 'Преподаватель';
      default: return 'Неизвестно';
    }
  };

  const getRoleBadgeClass = (role: number) => {
    switch (role) {
      case 1: return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 2: return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 3: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/3"></div>
              </div>
              <div className="w-20 h-6 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
              <div className="w-16 h-8 bg-gray-200 dark:bg-gray-600 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">
          👥
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Пользователи не найдены
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Попробуйте изменить параметры поиска или добавить новых пользователей
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* Column Controls - показываем только если showColumnControls = true и нет внешнего управления */}
      {showColumnControls && !columnVisibility && (
        <div className="mb-4 flex justify-end">
          <ColumnVisibilityControl
            columns={columns}
            onColumnToggle={toggleColumn}
          />
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden lg:block">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              {isColumnVisible('number') && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">
                  #
                </th>
              )}
              {isColumnVisible('user') && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Пользователь
                </th>
              )}
              {isColumnVisible('contacts') && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Контакты
                </th>
              )}
              {isColumnVisible('role') && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Роль
                </th>
              )}
              {isColumnVisible('group') && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Группа
                </th>
              )}
              {isColumnVisible('actions') && currentUser && canManageUsers(currentUser.role) && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Действия
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user, index) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                {isColumnVisible('number') && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                )}
                {isColumnVisible('user') && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <div className="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          @{user.login}
                        </div>
                      </div>
                    </div>
                  </td>
                )}
                {isColumnVisible('contacts') && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{user.email}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{user.phone}</div>
                  </td>
                )}
                {isColumnVisible('role') && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeClass(user.role)}`}>
                      {getRoleText(user.role)}
                    </span>
                  </td>
                )}
                {isColumnVisible('group') && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {user.groups.length > 0 
                      ? user.groups.map((group: string | { id: string; name?: string; groupName?: string }) => 
                          typeof group === 'string' ? group : group.name || group.groupName || group
                        ).join(', ') 
                      : '-'
                    }
                  </td>
                )}
                {isColumnVisible('actions') && currentUser && canManageUsers(currentUser.role) && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => onEdit(user)}
                        className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 
                                 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                        title="Редактировать"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(user)}
                        className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 
                                 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                        title="Удалить"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4 p-4">
        {users.map((user, index) => (
          <div key={user.id} className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 shadow-sm">
            <div className="flex items-start space-x-3">
              {isColumnVisible('number') && (
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 rounded-full">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </span>
                </div>
              )}
              {isColumnVisible('user') && (
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                  </div>
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  {isColumnVisible('user') && (
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.name}
                    </h4>
                  )}
                  {isColumnVisible('role') && (
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeClass(user.role)}`}>
                      {getRoleText(user.role)}
                    </span>
                  )}
                </div>
                
                <div className="mt-1 space-y-1">
                  {isColumnVisible('contacts') && (
                    <>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.phone}</p>
                    </>
                  )}
                  {isColumnVisible('group') && user.groups.length > 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Группы: {user.groups.map((group: string | { id: string; name?: string; groupName?: string }) => 
                        typeof group === 'string' ? group : group.name || group.groupName || group
                      ).join(', ')}
                    </p>
                  )}
                </div>

                {isColumnVisible('actions') && currentUser && canManageUsers(currentUser.role) && (
                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={() => onEdit(user)}
                      className="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 
                               text-sm font-medium rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => onDelete(user)}
                      className="flex-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 
                               text-sm font-medium rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      Удалить
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};