'use client';

import React from 'react';
import UniversalModal from '../ui/UniversalModal';
import { useUniversalModal } from '../../hooks/useUniversalModal';
import { UserForm } from '../forms/UserForm';
import { RoomForm, SubjectForm, GroupForm } from '../forms';
import { 
  createUserValidator, 
  createRoomValidator, 
  createSubjectValidator, 
  createGroupValidator 
} from '../../utils/validators';

// Пример использования для пользователей
export const UserModalExample: React.FC = () => {
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

  const handleSaveUser = async (userData: any, userId?: string) => {
    console.log('Saving user:', userData, userId);
    // Здесь ваша логика сохранения
  };

  const config = userModal.getConfig();

  return (
    <div>
      <button
        onClick={userModal.openCreateModal}
        className="px-4 py-2 bg-emerald-500 text-white rounded-lg"
      >
        Создать пользователя
      </button>

      <UniversalModal
        isOpen={userModal.isOpen}
        onClose={userModal.closeModal}
        mode={userModal.mode}
        title={config.title}
        subtitle={config.subtitle}
        icon={config.icon}
        gradientFrom={config.gradientFrom}
        gradientTo={config.gradientTo}
        initialData={userModal.initialData}
        data={userModal.editData}
        onSave={handleSaveUser}
        validate={createUserValidator}
        submitText={config.submitText}
        loadingText={config.loadingText}
      >
        {(props) => <UserForm {...props} />}
      </UniversalModal>
    </div>
  );
};

// Пример использования для кабинетов
export const RoomModalExample: React.FC = () => {
  const roomModal = useUniversalModal('room', {
    name: '',
    capacity: 0,
    description: ''
  });

  const handleSaveRoom = async (roomData: any, roomId?: string) => {
    console.log('Saving room:', roomData, roomId);
    // Здесь ваша логика сохранения
  };

  const config = roomModal.getConfig();

  return (
    <div>
      <button
        onClick={roomModal.openCreateModal}
        className="px-4 py-2 bg-purple-500 text-white rounded-lg"
      >
        Создать кабинет
      </button>

      <UniversalModal
        isOpen={roomModal.isOpen}
        onClose={roomModal.closeModal}
        mode={roomModal.mode}
        title={config.title}
        subtitle={config.subtitle}
        icon={config.icon}
        gradientFrom={config.gradientFrom}
        gradientTo={config.gradientTo}
        initialData={roomModal.initialData}
        data={roomModal.editData}
        onSave={handleSaveRoom}
        validate={createRoomValidator}
        submitText={config.submitText}
        loadingText={config.loadingText}
      >
        {(props) => <RoomForm {...props} />}
      </UniversalModal>
    </div>
  );
};

// Пример использования для предметов
export const SubjectModalExample: React.FC = () => {
  const subjectModal = useUniversalModal('subject', {
    name: '',
    description: ''
  });

  const handleSaveSubject = async (subjectData: any, subjectId?: string) => {
    console.log('Saving subject:', subjectData, subjectId);
    // Здесь ваша логика сохранения
  };

  const config = subjectModal.getConfig();

  return (
    <div>
      <button
        onClick={subjectModal.openCreateModal}
        className="px-4 py-2 bg-orange-500 text-white rounded-lg"
      >
        Создать предмет
      </button>

      <UniversalModal
        isOpen={subjectModal.isOpen}
        onClose={subjectModal.closeModal}
        mode={subjectModal.mode}
        title={config.title}
        subtitle={config.subtitle}
        icon={config.icon}
        gradientFrom={config.gradientFrom}
        gradientTo={config.gradientTo}
        initialData={subjectModal.initialData}
        data={subjectModal.editData}
        onSave={handleSaveSubject}
        validate={createSubjectValidator}
        submitText={config.submitText}
        loadingText={config.loadingText}
      >
        {(props) => <SubjectForm {...props} />}
      </UniversalModal>
    </div>
  );
};

// Пример использования для групп
export const GroupModalExample: React.FC = () => {
  const groupModal = useUniversalModal('group', {
    name: '',
    description: ''
  });

  const handleSaveGroup = async (groupData: any, groupId?: string) => {
    console.log('Saving group:', groupData, groupId);
    // Здесь ваша логика сохранения
  };

  const config = groupModal.getConfig();

  return (
    <div>
      <button
        onClick={groupModal.openCreateModal}
        className="px-4 py-2 bg-teal-500 text-white rounded-lg"
      >
        Создать группу
      </button>

      <UniversalModal
        isOpen={groupModal.isOpen}
        onClose={groupModal.closeModal}
        mode={groupModal.mode}
        title={config.title}
        subtitle={config.subtitle}
        icon={config.icon}
        gradientFrom={config.gradientFrom}
        gradientTo={config.gradientTo}
        initialData={groupModal.initialData}
        data={groupModal.editData}
        onSave={handleSaveGroup}
        validate={createGroupValidator}
        submitText={config.submitText}
        loadingText={config.loadingText}
      >
        {(props) => <GroupForm {...props} />}
      </UniversalModal>
    </div>
  );
};