'use client';

import { useState } from 'react';
import { Organization } from '../types/Organization';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  organization: Organization | null;
  onClose: () => void;
  onConfirm: (id: number) => Promise<void>;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  organization,
  onClose,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!organization) return;

    setIsDeleting(true);
    setError(null);

    try {
      await onConfirm(organization.id);
      onClose();
    } catch (err) {
      setError('Не удалось удалить организацию. Попробуйте еще раз.');
      console.error('Error deleting organization:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  if (!isOpen || !organization) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              Удалить организацию
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-4">
            Вы уверены, что хотите удалить следующую организацию? Это действие нельзя отменить.
          </p>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="text-sm">
              <div className="font-medium text-gray-900 mb-1">{organization.name}</div>
              <div className="text-gray-600 mb-1">Телефон: {organization.phone}</div>
              <div className="text-gray-600">Адрес: {organization.address}</div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Удаление...' : 'Удалить организацию'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;