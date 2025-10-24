'use client';

import { useState } from 'react';
import { Subject } from '../types/Subject';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface DeleteSubjectConfirmationModalProps {
  isOpen: boolean;
  subject: Subject | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}

const DeleteSubjectConfirmationModal: React.FC<DeleteSubjectConfirmationModalProps> = ({
  isOpen,
  subject,
  onClose,
  onConfirm,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!subject) return;

    setIsLoading(true);
    setError(null);

    try {
      await onConfirm(subject.id);
      onClose();
    } catch (err) {
      setError('Не удалось удалить предмет. Попробуйте еще раз.');
      console.error('Error deleting subject:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  if (!isOpen || !subject) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">
              Удалить предмет
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
          <p className="text-sm text-gray-600">
            Вы уверены, что хотите удалить предмет <strong>&ldquo;{subject.name}&rdquo;</strong>?
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Это действие нельзя отменить.
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Отмена
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Удаление...' : 'Удалить'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteSubjectConfirmationModal;
