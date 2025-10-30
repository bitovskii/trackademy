'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { ChevronDownIcon, UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import ThemeToggle from './ThemeToggle';

const TopBar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();

  // Don't show TopBar on login page
  if (pathname === '/login' || !isAuthenticated || !user) {
    return null;
  }

  return (
    <>
      {/* Desktop TopBar */}
      <div className="hidden lg:block bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg lg:ml-64">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Theme Toggle and Welcome */}
            <div className="flex-1 flex items-center space-x-4">
              <ThemeToggle />
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Добро пожаловать в <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">TrackAcademy</span>
              </div>
            </div>

            {/* Right side - User menu */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:shadow-lg transition-all duration-200 border border-gray-200/50 dark:border-gray-600/50 hover:scale-105"
              >
                {/* User Avatar */}
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm font-bold">
                    {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                
                {/* User Info */}
                <div className="text-left hidden sm:block">
                  <div className="text-gray-900 dark:text-white font-semibold">{user.fullName}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {user.role} • {typeof user.organizationNames === 'string' ? user.organizationNames : user.organizationNames?.[0] || 'Организация'}
                  </div>
                </div>
                
                {/* Dropdown Arrow */}
                <ChevronDownIcon 
                  className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`} 
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 py-2 z-50 overflow-hidden">
                  {/* User Info Header */}
                  <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-b border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold">
                          {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">{user.fullName}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">{user.email}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {user.role} в {typeof user.organizationNames === 'string' ? user.organizationNames : user.organizationNames?.[0] || 'организации'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <Link
                      href="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center px-6 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-200 group"
                    >
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3 group-hover:scale-110 transition-transform duration-200">
                        <UserIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="font-medium">Профиль</span>
                    </Link>
                    
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center px-6 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20 transition-all duration-200 group"
                    >
                      <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg mr-3 group-hover:scale-110 transition-transform duration-200">
                        <ArrowRightOnRectangleIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </div>
                      <span className="font-medium">Выйти</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile TopBar */}
      <div className="lg:hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg">
        <div className="px-4">
          <div className="flex justify-between items-center h-16">
            {/* Left side - User info for mobile */}
            <Link 
              href="/profile"
              className="flex items-center space-x-3 flex-1 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-bold">
                  {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-gray-900 dark:text-white font-semibold text-sm truncate">{user.fullName}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.role} • {typeof user.organizationNames === 'string' ? user.organizationNames : user.organizationNames?.[0] || 'Организация'}
                </div>
              </div>
            </Link>

            {/* Right side - Theme toggle and Logout button for mobile */}
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <button
                onClick={logout}
                className="p-3 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 hover:scale-110"
                title="Выйти"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay to close dropdown when clicking outside */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </>
  );
};

export default TopBar;