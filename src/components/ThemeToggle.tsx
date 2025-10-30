'use client';

import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-110"
      title={theme === 'light' ? 'Переключить на темную тему' : 'Переключить на светлую тему'}
    >
      {theme === 'light' ? (
        <MoonIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      ) : (
        <SunIcon className="w-5 h-5 text-yellow-500" />
      )}
    </button>
  );
};

export default ThemeToggle;