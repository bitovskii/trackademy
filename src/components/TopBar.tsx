'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { ChevronDownIcon, UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

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
      <div className="hidden lg:block bg-white border-b border-gray-200 shadow-sm lg:ml-64">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - можно добавить breadcrumbs или название страницы */}
            <div className="flex-1">
              {/* Пустое место для будущих элементов */}
            </div>

            {/* Right side - User menu */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 bg-gray-50 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                {/* User Avatar */}
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                
                {/* User Info */}
                <div className="text-left hidden sm:block">
                  <div className="text-gray-900 font-medium">{user.fullName}</div>
                  <div className="text-xs text-gray-500">
                    {user.role} • {typeof user.organizationNames === 'string' ? user.organizationNames : user.organizationNames?.[0] || 'Организация'}
                  </div>
                </div>
                
                {/* Dropdown Arrow */}
                <ChevronDownIcon 
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`} 
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="font-medium text-gray-900">{user.fullName}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {user.role} в {typeof user.organizationNames === 'string' ? user.organizationNames : user.organizationNames?.[0] || 'организации'}
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <UserIcon className="w-4 h-4 mr-3 text-gray-500" />
                      Профиль
                    </Link>
                    
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                      Выйти
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile TopBar */}
      <div className="lg:hidden bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4">
          <div className="flex justify-between items-center h-14">
            {/* Left side - User info for mobile */}
            <Link 
              href="/profile"
              className="flex items-center space-x-3 flex-1"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-gray-900 font-medium text-sm truncate">{user.fullName}</div>
                <div className="text-xs text-gray-500 truncate">
                  {user.role} • {typeof user.organizationNames === 'string' ? user.organizationNames : user.organizationNames?.[0] || 'Организация'}
                </div>
              </div>
            </Link>

            {/* Right side - Logout button for mobile */}
            <button
              onClick={logout}
              className="ml-2 p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              title="Выйти"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>
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