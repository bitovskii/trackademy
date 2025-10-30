import React, { useState, useEffect } from 'react';
import { Subject } from '../../types/Subject';
import { User } from '../../types/User';
import { AuthenticatedApiService } from '../../services/AuthenticatedApiService';

interface GroupFormUniversalProps {
  formData: any;
  setFormData: any;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  isSubmitting: boolean;
  organizationId: string;
}

export const GroupFormUniversal: React.FC<GroupFormUniversalProps> = ({
  formData,
  setFormData,
  errors,
  setErrors,
  isSubmitting,
  organizationId
}) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [organizationId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load subjects
      const subjectsResponse = await AuthenticatedApiService.post('/Subject/GetAllSubjects', {
        pageNumber: 1,
        pageSize: 1000,
        organizationId: organizationId
      });
      
      // Load students
      const studentsResponse = await AuthenticatedApiService.post('/User/get-users', {
        pageNumber: 1,
        pageSize: 1000,
        organizationId: organizationId,
        roles: [1] // Role 1 = Student
      });
      
      setSubjects((subjectsResponse as any).items || []);
      setStudents((studentsResponse as any).items || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentToggle = (studentId: string) => {
    const currentStudentIds = formData.studentIds || [];
    const updatedStudentIds = currentStudentIds.includes(studentId)
      ? currentStudentIds.filter((id: string) => id !== studentId)
      : [...currentStudentIds, studentId];
    
    setFormData((prev: any) => ({ ...prev, studentIds: updatedStudentIds }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-300">Загрузка данных...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Название и код группы */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Название группы
          </label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Введите название группы"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Код группы
          </label>
          <input
            type="text"
            value={formData.code || ''}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, code: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Введите код группы"
            disabled={isSubmitting}
          />
          {errors.code && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.code}</p>
          )}
        </div>
      </div>

      {/* Уровень и предмет */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Уровень
          </label>
          <select
            value={formData.level || ''}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, level: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            disabled={isSubmitting}
          >
            <option value="">Выберите уровень</option>
            <option value="Beginner">Начальный</option>
            <option value="Elementary">Элементарный</option>
            <option value="Intermediate">Средний</option>
            <option value="Upper-Intermediate">Выше среднего</option>
            <option value="Advanced">Продвинутый</option>
          </select>
          {errors.level && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.level}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Предмет *
          </label>
          <select
            value={formData.subjectId || ''}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, subjectId: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            disabled={isSubmitting}
            required
          >
            <option value="">Выберите предмет</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          {errors.subjectId && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.subjectId}</p>
          )}
        </div>
      </div>

      {/* Выбор студентов */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Студенты
        </label>
        <div className="max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700">
          {students.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              Нет доступных студентов
            </p>
          ) : (
            <div className="space-y-2">
              {students.map((student) => (
                <label key={student.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={(formData.studentIds || []).includes(student.id)}
                    onChange={() => handleStudentToggle(student.id)}
                    disabled={isSubmitting}
                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {student.login}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Выбрано студентов: {(formData.studentIds || []).length}
        </p>
        {errors.studentIds && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.studentIds}</p>
        )}
      </div>
    </div>
  );
};