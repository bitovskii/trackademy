// Пример использования UserModal на любой странице
'use client';

import React, { useState } from 'react';
import { UserModal, CreateUserData } from '../src/components';
import { User, UserFormData } from '../src/types/User';

const ExampleUserManagement: React.FC = () => {
  // Состояния для модалов
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Функции для создания пользователя
  const handleCreateUser = async (userData: CreateUserData) => {
    try {
      // Здесь ваша логика создания пользователя
      console.log('Creating user:', userData);
      
      // Пример API вызова:
      // await apiService.createUser(userData);
      
      setIsCreateModalOpen(false);
      // Обновить список пользователей
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  // Функции для редактирования пользователя
  const handleEditUser = async (userId: string, userData: UserFormData) => {
    try {
      // Здесь ваша логика редактирования пользователя
      console.log('Editing user:', userId, userData);
      
      // Пример API вызова:
      // await apiService.updateUser(userId, userData);
      
      setIsEditModalOpen(false);
      setEditingUser(null);
      // Обновить список пользователей
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  // Функция для открытия модала редактирования
  const openEditModal = (user: User) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Управление пользователями</h1>
      
      {/* Кнопки для открытия модалов */}
      <div className="space-x-4 mb-6">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
        >
          Создать пользователя
        </button>
        
        <button
          onClick={() => openEditModal({
            id: '1',
            login: 'testuser',
            name: 'Тестовый пользователь',
            email: 'test@example.com',
            phone: '+7 (999) 123-45-67',
            parentPhone: '+7 (999) 765-43-21',
            birthday: '2000-01-01',
            role: 1,
            groups: [],
            organizationId: '1'
          })}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Редактировать тестового пользователя
        </button>
      </div>

      {/* Универсальный модал для создания пользователя */}
      <UserModal
        isOpen={isCreateModalOpen}
        mode="create"
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateUser}
      />

      {/* Универсальный модал для редактирования пользователя */}
      <UserModal
        isOpen={isEditModalOpen}
        mode="edit"
        user={editingUser}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingUser(null);
        }}
        onSave={async (data: any, userId?: string) => {
          if (userId) {
            await handleEditUser(userId, data);
          }
        }}
      />
    </div>
  );
};

export default ExampleUserManagement;