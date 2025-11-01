'use client';

import React from 'react';
import { 
  UniversalModal, 
  useUniversalModal, 
  UserForm,
  RoomForm,
  createUserValidator,
  createRoomValidator
} from '../../components';
import { UserFormData } from '../../types/User';
import { RoomFormData } from '../../types/Room';

const UniversalModalDemo: React.FC = () => {
  // Модал для пользователей
  const userModal = useUniversalModal('user', {
    login: '',
    fullName: '',
    email: '',
    password: '',
    phone: '',
    parentPhone: '',
    birthday: '',
    role: 1,
    organizationId: ''
  });

  // Модал для кабинетов
  const roomModal = useUniversalModal('room', {
    name: '',
    capacity: 0,
    description: ''
  });

  const handleSaveUser = async (userData: UserFormData, userId?: string) => {
    console.log('Saving user:', userData, userId);
    // Здесь ваша логика сохранения пользователя
    alert(`${userId ? 'Обновлен' : 'Создан'} пользователь: ${userData.fullName}`);
  };

  const handleSaveRoom = async (roomData: RoomFormData, roomId?: string) => {
    console.log('Saving room:', roomData, roomId);
    // Здесь ваша логика сохранения кабинета
    alert(`${roomId ? 'Обновлен' : 'Создан'} кабинет: ${roomData.name}`);
  };

  // Пример данных для редактирования
  const sampleUser = {
    id: '1',
    login: 'testuser',
    fullName: 'Тестовый Пользователь',
    email: 'test@example.com',
    password: '', // For edit mode, password can be empty
    phone: '+7 (999) 123-45-67',
    parentPhone: '+7 (999) 765-43-21',
    birthday: '2000-01-01',
    role: 1,
    organizationId: '1'
  };

  const sampleRoom = {
    id: '1',
    name: 'Кабинет 101',
    capacity: 30,
    description: 'Просторный кабинет для лекций'
  };

  const userConfig = userModal.getConfig();
  const roomConfig = roomModal.getConfig();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">
        🎯 Демо универсальной системы модалов
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Пользователи */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            👥 Управление пользователями
          </h2>
          <div className="space-y-3">
            <button
              onClick={userModal.openCreateModal}
              className="w-full px-4 py-2 bg-gradient-to-r from-emerald-500 to-lime-600 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Создать пользователя
            </button>
            <button
              onClick={() => userModal.openEditModal(sampleUser)}
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Редактировать тестового пользователя
            </button>
          </div>
        </div>

        {/* Кабинеты */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            🏢 Управление кабинетами
          </h2>
          <div className="space-y-3">
            <button
              onClick={roomModal.openCreateModal}
              className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Создать кабинет
            </button>
            <button
              onClick={() => roomModal.openEditModal(sampleRoom)}
              className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Редактировать тестовый кабинет
            </button>
          </div>
        </div>
      </div>

      {/* Информация о системе */}
      <div className="mt-8 bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
          ✨ Особенности универсальной системы:
        </h3>
        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
          <li>🎨 <strong>Автоматические темы</strong> для каждого типа сущности</li>
          <li>📝 <strong>Готовые формы</strong> с валидацией</li>
          <li>🔄 <strong>Один компонент</strong> для создания и редактирования</li>
          <li>⚡ <strong>Легкое расширение</strong> для новых типов</li>
          <li>🛡️ <strong>TypeScript поддержка</strong> из коробки</li>
        </ul>
      </div>

      {/* Модал для пользователей */}
      <UniversalModal
        isOpen={userModal.isOpen}
        onClose={userModal.closeModal}
        mode={userModal.mode}
        title={userConfig.title}
        subtitle={userConfig.subtitle}
        icon={userConfig.icon}
        gradientFrom={userConfig.gradientFrom}
        gradientTo={userConfig.gradientTo}
        initialData={userModal.initialData}
        data={userModal.editData}
        onSave={handleSaveUser}
        validate={createUserValidator}
        submitText={userConfig.submitText}
        loadingText={userConfig.loadingText}
      >
        {(props) => <UserForm {...props} />}
      </UniversalModal>

      {/* Модал для кабинетов */}
      <UniversalModal
        isOpen={roomModal.isOpen}
        onClose={roomModal.closeModal}
        mode={roomModal.mode}
        title={roomConfig.title}
        subtitle={roomConfig.subtitle}
        icon={roomConfig.icon}
        gradientFrom={roomConfig.gradientFrom}
        gradientTo={roomConfig.gradientTo}
        initialData={roomModal.initialData}
        data={roomModal.editData}
        onSave={handleSaveRoom}
        validate={createRoomValidator}
        submitText={roomConfig.submitText}
        loadingText={roomConfig.loadingText}
        maxWidth="lg"
      >
        {(props) => <RoomForm {...props} />}
      </UniversalModal>
    </div>
  );
};

export default UniversalModalDemo;