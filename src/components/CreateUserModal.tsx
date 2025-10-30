'use client';

import React from 'react';
import UserModal, { CreateUserData } from './UserModal';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: CreateUserData) => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onSave }) => {
  return (
    <UserModal
      isOpen={isOpen}
      onClose={onClose}
      mode="create"
      onSave={onSave}
    />
  );
};

export default CreateUserModal;
export type { CreateUserData };