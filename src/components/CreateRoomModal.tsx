'use client';

import { useState } from 'react';
import { RoomFormData } from '../types/Room';
import { XMarkIcon, HomeIcon } from '@heroicons/react/24/outline';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: RoomFormData) => Promise<void>;
}

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<RoomFormData>({
    name: '',
    capacity: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const dataToSend = {
        ...formData,
        capacity: Number(formData.capacity), // Ensure capacity is a number
      };
      
      await onSave(dataToSend);
      setFormData({ name: '', capacity: 1 }); // Reset form
      onClose();
    } catch (err) {
      setError('Не удалось создать кабинет. Попробуйте еще раз.');
      console.error('Error creating room:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'capacity') {
      // Ensure capacity is a positive number
      const numValue = Number.parseInt(value) || 1;
      setFormData(prev => ({
        ...prev,
        [name]: Math.max(1, numValue), // Minimum capacity of 1
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleClose = () => {
    setFormData({ name: '', capacity: 1 }); // Reset form on close
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
                <HomeIcon className="w-3 h-3" />
              </div>
              <div>
                <h2 className="text-sm font-bold">Добавить кабинет</h2>
                <p className="text-white/80 text-xs">Создайте новый кабинет в системе</p>
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

            {/* Room Information */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-1">
                Информация о кабинете
              </h3>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Название кабинета *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-2 py-1.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-0 focus:border-primary transition-colors dark:bg-gray-700 dark:text-white text-sm"
                  placeholder="Например: Аудитория 101"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Вместимость (количество мест) *
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  min="1"
                  max="1000"
                  required
                  className="w-full px-2 py-1.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-0 focus:border-primary transition-colors dark:bg-gray-700 dark:text-white text-sm"
                  placeholder="30"
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
                    <HomeIcon className="w-3 h-3" />
                    <span>Создать кабинет</span>
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

export default CreateRoomModal;
