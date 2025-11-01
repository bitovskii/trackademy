'use client';

import React from 'react';
import UserModal from './UserModal';
import { UserFormData } from '../types/User';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: UserFormData) => void | Promise<void>;
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