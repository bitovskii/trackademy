'use client';

import React from 'react';
import { User, UserFormData } from '../types/User';
import UserModal from './UserModal';

interface EditUserModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (id: string, data: UserFormData) => Promise<void>;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  user,
  onClose,
  onSave,
}) => {
  const handleSave = async (data: UserFormData, userId?: string) => {
    if (userId) {
      await onSave(userId, data);
    }
  };

  return (
    <UserModal
      isOpen={isOpen}
      onClose={onClose}
      mode="edit"
      user={user}
      onSave={handleSave}
    />
  );
};

export default EditUserModal;