'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Group, GroupFormData } from '../types/Group';
import { Subject } from '../types/Subject';
import { User } from '../types/User';
import { AuthenticatedApiService } from '../services/AuthenticatedApiService';
import { MultiSelect } from './ui/MultiSelect';

interface EditGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, formData: GroupFormData) => Promise<void>;
  group: Group | null;
  organizationId: string;
}

const EditGroupModal: React.FC<EditGroupModalProps> = ({
  isOpen,
  onClose,
  onSave,
  group,
  organizationId
}) => {
  const [formData, setFormData] = useState<GroupFormData>({
    name: '',
    code: '',
    level: '',
    subjectId: '',
    studentIds: [],
    organizationId: organizationId
  });
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && group) {
      setFormData({
        name: group.name,
        code: group.code,
        level: group.level,
        subjectId: group.subject.subjectId,
        studentIds: group.students.map(s => s.studentId),
        organizationId: organizationId
      });
      loadSubjects();
      loadStudents();
      setError(null);
    }
  }, [isOpen, group, organizationId]);

  const loadSubjects = async () => {
    try {
      setSubjectsLoading(true);
      const response: { items: Subject[] } = await AuthenticatedApiService.post('/Subject/GetAllSubjects', {
        pageNumber: 1,
        pageSize: 1000,
        organizationId: organizationId
      });
      setSubjects(response.items || []);
    } catch (error) {
      console.error('Failed to load subjects:', error);
    } finally {
      setSubjectsLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      setStudentsLoading(true);
      // Загружаем только студентов (роль ID = 1)
      const response = await AuthenticatedApiService.getUsers({
        organizationId,
        pageNumber: 1,
        pageSize: 1000,
        roleIds: [1] // ID роли студента
      });
      setStudents(response.items || []);
    } catch (error) {
      console.error('Failed to load students:', error);
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group) return;
    
    setError(null);

    // Валидация
    if (!formData.subjectId) {
      setError('Выберите предмет');
      return;
    }
    if (formData.studentIds.length === 0) {
      setError('Выберите хотя бы одного студента');
      return;
    }

    try {
      setLoading(true);
      await onSave(group.id, formData);
      onClose();
    } catch (error) {
      console.error('Error updating group:', error);
      setError(error instanceof Error ? error.message : 'Произошла ошибка при обновлении группы');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof GroupFormData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStudentChange = (studentIds: string[]) => {
    setFormData(prev => ({
      ...prev,
      studentIds
    }));
  };

  if (!isOpen || !group) return null;

  // Преобразуем студентов для MultiSelect с отображением имени и логина
  const studentOptions = students.map(student => ({
    id: student.id,
    name: student.name || student.login, // используем name, если есть, иначе login
    secondaryText: student.login // показываем логин как дополнительную информацию
  }));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-indigo-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Редактировать группу</h3>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="px-6 py-4 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Название группы */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Название группы
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Введите название группы"
                disabled={loading}
              />
            </div>

            {/* Код группы */}
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Код группы
              </label>
              <input
                type="text"
                id="code"
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Введите код группы"
                disabled={loading}
              />
            </div>

            {/* Уровень */}
            <div>
              <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                Уровень
              </label>
              <input
                type="text"
                id="level"
                value={formData.level}
                onChange={(e) => handleInputChange('level', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Введите уровень (например, начальный, продвинутый)"
                disabled={loading}
              />
            </div>

            {/* Предмет */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Предмет *
              </label>
              {subjectsLoading ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  <span className="text-gray-500">Загрузка предметов...</span>
                </div>
              ) : (
                <select
                  id="subject"
                  value={formData.subjectId}
                  onChange={(e) => handleInputChange('subjectId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">Выберите предмет</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Студенты */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Студенты *
              </label>
              {studentsLoading ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  <span className="text-gray-500">Загрузка студентов...</span>
                </div>
              ) : (
                <MultiSelect
                  options={studentOptions}
                  selectedValues={formData.studentIds}
                  onChange={handleStudentChange}
                  placeholder={studentOptions.length > 0 ? "Выберите студентов..." : "Студенты не найдены"}
                  disabled={loading || studentOptions.length === 0}
                  maxHeight="200px"
                />
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGroupModal;