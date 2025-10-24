'use client';

import UserDiagnostics from '@/components/UserDiagnostics';

export default function DiagnosticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <UserDiagnostics />
    </div>
  );
}
