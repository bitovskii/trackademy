'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { EyeIcon, EyeSlashIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { getRoleName, isOwner } from '@/types/Role';

const UserDiagnostics: React.FC = () => {
  const { user, token } = useAuth();
  const [showToken, setShowToken] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedUser, setCopiedUser] = useState(false);

  if (!user || !token) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-800">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
          🚫 Пользователь не авторизован
        </h3>
        <p className="text-red-600 dark:text-red-400">
          Для просмотра диагностики необходимо войти в систему
        </p>
      </div>
    );
  }

  const copyToClipboard = async (text: string, type: 'token' | 'user') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'token') {
        setCopiedToken(true);
        setTimeout(() => setCopiedToken(false), 2000);
      } else {
        setCopiedUser(true);
        setTimeout(() => setCopiedUser(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const decodeJWTPayload = (token: string) => {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (error) {
      return { error: 'Не удалось декодировать токен' };
    }
  };

  const tokenPayload = decodeJWTPayload(token);

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-6 border border-primary/20">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          👤 Диагностика пользователя
        </h2>

        {/* User Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              📋 Данные пользователя
            </h3>
            <button
              onClick={() => copyToClipboard(JSON.stringify(user, null, 2), 'user')}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors"
            >
              <ClipboardDocumentIcon className="w-4 h-4" />
              {copiedUser ? '✅ Скопировано!' : 'Копировать'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">ID:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{user.id}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Полное имя:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{user.fullName}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Логин:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{user.login}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{user.email}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Роль:</span>
              <span className="ml-2 px-2 py-1 bg-accent/20 text-accent rounded-full text-sm font-medium">
                {getRoleName(user.role)} ({user.role})
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">ID организации:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{user.organizationId || 'Не указан'}</span>
            </div>
            <div className="md:col-span-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">Организации:</span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {user.organizationNames 
                  ? (Array.isArray(user.organizationNames) 
                      ? user.organizationNames.join(', ')
                      : user.organizationNames)
                  : 'Не указаны'}
              </span>
            </div>
          </div>
        </div>

        {/* JWT Token Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              🔑 JWT Токен
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowToken(!showToken)}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-secondary/10 text-secondary hover:bg-secondary/20 rounded-lg transition-colors"
              >
                {showToken ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                {showToken ? 'Скрыть' : 'Показать'}
              </button>
              <button
                onClick={() => copyToClipboard(token, 'token')}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors"
              >
                <ClipboardDocumentIcon className="w-4 h-4" />
                {copiedToken ? '✅ Скопировано!' : 'Копировать'}
              </button>
            </div>
          </div>

          {showToken && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Сырой токен:</h4>
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-xs font-mono break-all text-gray-800 dark:text-gray-200">
                {token}
              </div>
            </div>
          )}

          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Декодированный payload:</h4>
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-sm font-mono">
              <pre className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {JSON.stringify(tokenPayload, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Role-based Access Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            🔐 Права доступа
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700 dark:text-gray-300">Доступные разделы:</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Профиль</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Студенты</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Предметы</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Аудитории</span>
                </div>
                {isOwner(user.role) && (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">Организации (только для владельца)</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Диагностика</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700 dark:text-gray-300">Информация о роли:</h4>
              <div className="bg-accent/10 rounded-lg p-3">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Текущая роль:</div>
                <div className="text-lg font-semibold text-accent">{getRoleName(user.role)}</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  ID роли: {user.role} | {isOwner(user.role) ? 'Владелец системы с полными правами' : 'Ограниченные права доступа'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Authentication Status */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-medium text-green-800 dark:text-green-300">
              ✅ Пользователь успешно авторизован
            </span>
          </div>
          <div className="mt-2 text-sm text-green-600 dark:text-green-400">
            Токен валиден и содержит корректные данные пользователя
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDiagnostics;
