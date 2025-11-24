'use client';

import { WrenchScrewdriverIcon } from '@heroicons/react/24/outline';

export default function MarketPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="text-center px-4">
        <div className="mb-8">
          <WrenchScrewdriverIcon className="h-24 w-24 mx-auto text-blue-500 dark:text-blue-400 animate-pulse" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Маркет
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
          Страница находится на стадии разработки
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Скоро здесь появится новый функционал
        </p>
      </div>
    </div>
  );
}
