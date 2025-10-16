export default function Profile() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Профиль пользователя
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Здесь будет информация о пользователе
        </p>
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Иван Иванов</h2>
            <p className="text-gray-600">Администратор системы</p>
            <p className="text-gray-500 text-sm mt-2">ivan@trackacademy.ru</p>
          </div>
        </div>
      </div>
    </div>
  );
}