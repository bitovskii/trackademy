'use client';

import { useState, useEffect } from 'react';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  group: string;
  enrollmentDate: string;
  status: 'active' | 'inactive' | 'graduated';
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    const mockStudents: Student[] = [
      {
        id: 1,
        firstName: 'Алексей',
        lastName: 'Иванов',
        email: 'aleksey.ivanov@example.com',
        phone: '+77021234567',
        group: 'ИТ-21',
        enrollmentDate: '2021-09-01',
        status: 'active'
      },
      {
        id: 2,
        firstName: 'Мария',
        lastName: 'Петрова',
        email: 'maria.petrova@example.com',
        phone: '+77027654321',
        group: 'ИТ-21',
        enrollmentDate: '2021-09-01',
        status: 'active'
      },
      {
        id: 3,
        firstName: 'Дмитрий',
        lastName: 'Сидоров',
        email: 'dmitry.sidorov@example.com',
        phone: '+77029876543',
        group: 'ИТ-20',
        enrollmentDate: '2020-09-01',
        status: 'graduated'
      },
      {
        id: 4,
        firstName: 'Анна',
        lastName: 'Козлова',
        email: 'anna.kozlova@example.com',
        phone: '+77025432109',
        group: 'ИТ-22',
        enrollmentDate: '2022-09-01',
        status: 'active'
      },
      {
        id: 5,
        firstName: 'Сергей',
        lastName: 'Новиков',
        email: 'sergey.novikov@example.com',
        phone: '+77023456789',
        group: 'ИТ-21',
        enrollmentDate: '2021-09-01',
        status: 'inactive'
      }
    ];

    setTimeout(() => {
      setStudents(mockStudents);
      setLoading(false);
    }, 500);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'graduated':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Активный';
      case 'inactive':
        return 'Неактивный';
      case 'graduated':
        return 'Выпускник';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Студенты</h2>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
            Добавить студента
          </button>
        </div>
        
        {/* Mobile Card View */}
        <div className="block md:hidden">
          {students.map((student) => (
            <div key={student.id} className="p-4 border-b border-gray-200 last:border-b-0">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-900">
                  {student.firstName} {student.lastName}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                  {getStatusText(student.status)}
                </span>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Email:</span>
                  <span className="font-medium">{student.email}</span>
                </div>
                <div className="flex justify-between">
                  <span>Телефон:</span>
                  <span className="font-medium">{student.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span>Группа:</span>
                  <span className="font-medium">{student.group}</span>
                </div>
                <div className="flex justify-between">
                  <span>Поступление:</span>
                  <span className="font-medium">{student.enrollmentDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Имя
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Телефон
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Группа
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Поступление
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {student.firstName} {student.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.group}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.enrollmentDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                      {getStatusText(student.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-2xl font-bold text-blue-600">{students.length}</div>
          <div className="text-sm text-gray-500">Всего студентов</div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-2xl font-bold text-green-600">
            {students.filter(s => s.status === 'active').length}
          </div>
          <div className="text-sm text-gray-500">Активных</div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-2xl font-bold text-blue-600">
            {students.filter(s => s.status === 'graduated').length}
          </div>
          <div className="text-sm text-gray-500">Выпускников</div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-2xl font-bold text-yellow-600">
            {students.filter(s => s.status === 'inactive').length}
          </div>
          <div className="text-sm text-gray-500">Неактивных</div>
        </div>
      </div>
    </div>
  );
}
