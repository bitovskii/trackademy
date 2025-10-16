'use client';

import { useState } from 'react';
import { OrganizationFormData } from '../types/Organization';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface CreateOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: OrganizationFormData) => Promise<void>;
}

const CreateOrganizationModal: React.FC<CreateOrganizationModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<OrganizationFormData>({
    name: '',
    phone: '+7',
    address: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Convert masked phone to database format (+7 followed by digits only)
      const phoneForDatabase = '+7' + formData.phone.slice(2).replaceAll(/\D/g, '');
      
      const dataToSend = {
        ...formData,
        phone: phoneForDatabase,
      };
      
      await onSave(dataToSend);
      setFormData({ name: '', phone: '+7', address: '' }); // Reset form
      onClose();
    } catch (err) {
      setError('Не удалось создать организацию. Попробуйте еще раз.');
      console.error('Error creating organization:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      // Always ensure +7 prefix
      if (!value.startsWith('+7')) {
        setFormData(prev => ({
          ...prev,
          [name]: '+7',
        }));
        return;
      }
      
      // Remove +7 and all non-digits from the rest
      const digits = value.slice(2).replaceAll(/\D/g, '');
      
      // Apply phone mask +7(xxx) xxx-xxxx
      let maskedValue = '+7';
      if (digits.length > 0) {
        if (digits.length <= 3) {
          maskedValue = `+7(${digits}`;
        } else if (digits.length <= 6) {
          maskedValue = `+7(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        } else {
          maskedValue = `+7(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
        }
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: maskedValue,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleClose = () => {
    setFormData({ name: '', phone: '+7', address: '' }); // Reset form on close
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Создать новую организацию
          </h3>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Название организации
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Телефон
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+7(771) 434-2323"
              maxLength={17}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Адрес
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Создание...' : 'Создать организацию'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrganizationModal;