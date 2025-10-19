'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BuildingOfficeIcon, HomeModernIcon, HomeIcon, UserCircleIcon, AcademicCapIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { BuildingOfficeIcon as BuildingOfficeIconSolid, HomeModernIcon as HomeModernIconSolid, HomeIcon as HomeIconSolid, UserCircleIcon as UserCircleIconSolid, AcademicCapIcon as AcademicCapIconSolid, BookOpenIcon as BookOpenIconSolid } from '@heroicons/react/24/solid';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import RegisterModal from './RegisterModal';

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const allNavigation = [
    { name: 'Главная', href: '/', icon: HomeIcon, activeIcon: HomeIconSolid },
    { name: 'Организации', href: '/organizations', icon: BuildingOfficeIcon, activeIcon: BuildingOfficeIconSolid, requireAuth: true },
    { name: 'Студенты', href: '/students', icon: AcademicCapIcon, activeIcon: AcademicCapIconSolid, requireAuth: true },
    { name: 'Кабинеты', href: '/rooms', icon: HomeModernIcon, activeIcon: HomeModernIconSolid, requireAuth: true },
    { name: 'Предметы', href: '/subjects', icon: BookOpenIcon, activeIcon: BookOpenIconSolid, requireAuth: true },
    { name: 'Профиль', href: '/profile', icon: UserCircleIcon, activeIcon: UserCircleIconSolid, requireAuth: true },
  ];

  // Filter navigation based on authentication status
  const navigation = isAuthenticated 
    ? allNavigation 
    : allNavigation.filter(item => !item.requireAuth);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Instagram-style Bottom Navigation Bar - Mobile Only */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex items-center justify-around py-2">
          {navigation.map((item) => {
            const active = isActive(item.href);
            const IconComponent = active ? item.activeIcon : item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center py-2 px-3 transition-colors"
              >
                <IconComponent
                  className={`h-6 w-6 ${
                    active ? 'text-blue-600' : 'text-gray-400'
                  }`}
                />
                <span className={`text-xs mt-1 ${
                  active ? 'text-blue-600 font-medium' : 'text-gray-400'
                }`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-64 lg:bg-white lg:shadow-lg lg:border-r lg:border-gray-200 lg:flex-col">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
          <span className="text-xl font-bold text-blue-600">TrackAcademy</span>
        </div>
        
        {/* Navigation Links */}
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
                    ${isActive(item.href)
                      ? 'bg-blue-100 text-blue-900 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <IconComponent
                    className={`
                      mr-3 flex-shrink-0 h-6 w-6 transition-colors
                      ${isActive(item.href) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}
                    `}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sign In/Register Buttons or User Menu at Bottom */}
        <div className="flex-shrink-0 border-t border-gray-200 p-4">
          {isAuthenticated ? (
            <button 
              onClick={logout}
              className="w-full bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Выйти
            </button>
          ) : (
            <div className="space-y-2">
              <Link 
                href="/login"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors block text-center"
              >
                Войти
              </Link>
              <button 
                onClick={() => setShowRegisterModal(true)}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Регистрация
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Register Modal */}
      <RegisterModal 
        isOpen={showRegisterModal} 
        onClose={() => setShowRegisterModal(false)} 
      />
    </>
  );
};

export default Sidebar;