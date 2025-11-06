'use client';

import { useState, useEffect } from 'react';
import { DateRangePicker } from './ui/DateRangePicker';
import { attendanceApi } from '@/services/AttendanceApiService';
import { ExportAttendanceRequest, AttendanceStatus } from '@/types/Attendance';
import { useToast } from '@/contexts/ToastContext';
import { DocumentArrowDownIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ExportAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
}

export const ExportAttendanceModal = ({ 
  isOpen, 
  onClose, 
  organizationId 
}: ExportAttendanceModalProps) => {
  const { showSuccess, showError } = useToast();
  
  const [formData, setFormData] = useState<ExportAttendanceRequest>({
    organizationId,
    fromDate: '',
    toDate: '',
  });
  
  const [loading, setLoading] = useState(false);

  // Сброс формы при открытии модалки
  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      setFormData({
        organizationId,
        fromDate: firstDayOfMonth.toISOString().split('T')[0],
        toDate: today.toISOString().split('T')[0],
      });
    }
  }, [isOpen, organizationId]);

  const handleDateRangeChange = (startDate?: string, endDate?: string) => {
    setFormData(prev => ({
      ...prev,
      fromDate: startDate || '',
      toDate: endDate || ''
    }));
  };

  const handleStatusChange = (status: string) => {
    setFormData(prev => ({
      ...prev,
      status: status === '' ? undefined : Number(status) as AttendanceStatus
    }));
  };

  const handleExport = async () => {
    if (!formData.fromDate || !formData.toDate) {
      showError('Пожалуйста, выберите период для экспорта');
      return;
    }

    if (new Date(formData.fromDate) > new Date(formData.toDate)) {
      showError('Дата начала не может быть больше даты окончания');
      return;
    }

    setLoading(true);
    try {
      const blob = await attendanceApi.exportAttendance(formData);
      
      // Создаем ссылку для скачивания
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Формируем имя файла с датами
      const fromDate = new Date(formData.fromDate).toLocaleDateString('ru-RU').replace(/\./g, '-');
      const toDate = new Date(formData.toDate).toLocaleDateString('ru-RU').replace(/\./g, '-');
      link.download = `посещаемость_${fromDate}_${toDate}.xlsx`;
      
      // Скачиваем файл
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Освобождаем память
      URL.revokeObjectURL(url);
      
      showSuccess('Отчет успешно экспортирован');
      onClose();
      
    } catch (error) {
      console.error('Ошибка экспорта:', error);
      showError(
        error instanceof Error ? error.message : 'Ошибка при экспорте данных'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DocumentArrowDownIcon className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Экспорт посещаемости
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Выгрузите данные посещаемости в Excel
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          {/* Период дат - обязательное поле */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Период <span className="text-red-500">*</span>
            </label>
            <DateRangePicker
              startDate={formData.fromDate}
              endDate={formData.toDate}
              onDateChange={handleDateRangeChange}
            />
          </div>

          {/* Статус посещения - опциональное поле */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Статус посещения
            </label>
            <select
              value={formData.status || ''}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Все статусы</option>
              <option value="1">Присутствовал</option>
              <option value="2">Отсутствовал</option>
              <option value="3">Опоздал</option>
              <option value="4">Уважительная причина</option>
            </select>
          </div>

          {/* Информация */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              💡 Экспорт включит данные всех студентов вашей организации за выбранный период
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Отмена
          </button>
          <button
            onClick={handleExport}
            disabled={loading || !formData.fromDate || !formData.toDate}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Экспорт...
              </>
            ) : (
              <>
                <DocumentArrowDownIcon className="w-4 h-4" />
                Экспортировать
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};