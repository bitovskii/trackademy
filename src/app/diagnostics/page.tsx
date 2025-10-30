'use client';

import UserDiagnostics from '@/components/UserDiagnostics';
import { PageHeaderWithStats } from '../../components/ui/PageHeaderWithStats';
import { ChartBarIcon } from '@heroicons/react/24/outline';

export default function DiagnosticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-gray-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <PageHeaderWithStats
              title="Диагностика системы"
              subtitle="Мониторинг состояния и производительности системы"
              icon={ChartBarIcon}
              gradientFrom="rose-500"
              gradientTo="orange-600"
              stats={[
                { label: "Статус системы", value: "Активна", color: "emerald" },
                { label: "Производительность", value: "Отлично", color: "rose" },
                { label: "Соединения", value: "Стабильно", color: "orange" }
              ]}
            />
          </div>

          {/* Diagnostics Component */}
          <UserDiagnostics />
        </div>
      </div>
    </div>
  );
}
