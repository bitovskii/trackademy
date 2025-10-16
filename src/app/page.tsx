export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Добро пожаловать в TrackAcademy
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Система управления образовательным учреждением
        </p>
        <div className="space-y-4">
          <a
            href="/organizations"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Управление организациями
          </a>
          <br />
          <a
            href="/rooms"
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Управление кабинетами
          </a>
        </div>
      </div>
    </div>
  );
}
