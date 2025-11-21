'use client';

import { useState } from 'react';
import { SubjectFormData } from '../types/Subject';
import { XMarkIcon, BookOpenIcon } from '@heroicons/react/24/outline';

interface CreateSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SubjectFormData) => Promise<void>;
}

const CreateSubjectModal: React.FC<CreateSubjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<SubjectFormData>({
    name: '',
    description: '',
    price: 0,
    paymentType: 1
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await onSave(formData);
      setFormData({ name: '', description: '', price: 0, paymentType: 1 }); // Reset form
      onClose();
    } catch (err) {
      setError('Не удалось создать предмет. Попробуйте еще раз.');
      console.error('Error creating subject:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClose = () => {
    setFormData({ name: '', description: '', price: 0, paymentType: 1 }); // Reset form on close
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[70vh] overflow-hidden">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-r from-primary to-secondary p-2 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                <BookOpenIcon className="w-3 h-3" />
              </div>
              <div>
                <h2 className="text-sm font-bold">Добавить предмет</h2>
                <p className="text-white/80 text-xs">Создайте новый предмет в системе</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-5 h-5 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
            >
              <XMarkIcon className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-2 max-h-[calc(70vh-60px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-2">
            {error && (
              <div className="mb-2 p-2 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 rounded text-xs">
                {error}
              </div>
            )}

            {/* Subject Name */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-1">
                Информация о предмете
              </h3>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Название предмета *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-2 py-1.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-0 focus:border-primary transition-colors dark:bg-gray-700 dark:text-white text-sm"
                  placeholder="Например: Математика"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Описание
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-2 py-1.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-0 focus:border-primary transition-colors dark:bg-gray-700 dark:text-white text-sm resize-none"
                  placeholder="Описание предмета (необязательно)"
                />
              </div>
            </div>

            {/* Form Buttons */}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-600 flex space-x-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-3 py-1.5 border-2 border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors font-medium text-xs"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-3 py-1.5 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center space-x-1 text-xs"
              >
                {isLoading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Создание...</span>
                  </>
                ) : (
                  <>
                    <BookOpenIcon className="w-3 h-3" />
                    <span>Создать предмет</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateSubjectModal;
