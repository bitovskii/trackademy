'use client';

import { useState } from 'react';

export default function RoomsPage() {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  // Mock data for rooms
  const rooms = [
    { id: '101', name: 'Кабинет 101', capacity: 30, type: 'Лекционный зал', equipment: 'Проектор, доска, микрофон' },
    { id: '102', name: 'Кабинет 102', capacity: 20, type: 'Компьютерный класс', equipment: '20 компьютеров, проектор' },
    { id: '103', name: 'Кабинет 103', capacity: 15, type: 'Семинарская комната', equipment: 'Доска, столы для групповой работы' },
    { id: '201', name: 'Кабинет 201', capacity: 25, type: 'Лаборатория', equipment: 'Лабораторное оборудование, вытяжка' },
    { id: '202', name: 'Кабинет 202', capacity: 40, type: 'Актовый зал', equipment: 'Сцена, звуковая система, проектор' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">Кабинеты</h1>
          <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors">
            Добавить кабинет
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <div 
                key={room.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedRoom === room.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedRoom(selectedRoom === room.id ? null : room.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{room.name}</h3>
                  <span className="text-sm text-gray-500">#{room.id}</span>
                </div>
                
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Тип:</span>
                    <span className="font-medium">{room.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Вместимость:</span>
                    <span className="font-medium">{room.capacity} чел.</span>
                  </div>
                </div>

                {selectedRoom === room.id && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Оборудование:</span><br />
                      {room.equipment}
                    </p>
                    <div className="flex space-x-2 mt-3">
                      <button className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        Редактировать
                      </button>
                      <button className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                        Удалить
                      </button>
                      <button className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        Расписание
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Statistics section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{rooms.length}</div>
            <div className="text-sm text-gray-600">Всего кабинетов</div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {rooms.reduce((sum, room) => sum + room.capacity, 0)}
            </div>
            <div className="text-sm text-gray-600">Общая вместимость</div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">3</div>
            <div className="text-sm text-gray-600">Типы кабинетов</div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Быстрые действия</h2>
        <div className="flex flex-wrap gap-3">
          <button className="bg-blue-100 text-blue-700 px-4 py-2 rounded-md text-sm hover:bg-blue-200 transition-colors">
            Проверить расписание
          </button>
          <button className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-md text-sm hover:bg-yellow-200 transition-colors">
            Техническое обслуживание
          </button>
          <button className="bg-purple-100 text-purple-700 px-4 py-2 rounded-md text-sm hover:bg-purple-200 transition-colors">
            Бронирование
          </button>
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-200 transition-colors">
            Отчеты
          </button>
        </div>
      </div>
    </div>
  );
}