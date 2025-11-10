'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BuildingOfficeIcon, HomeModernIcon, HomeIcon, AcademicCapIcon, BookOpenIcon, UserGroupIcon, CalendarDaysIcon, CalendarIcon, ClipboardDocumentCheckIcon, CurrencyDollarIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { BuildingOfficeIcon as BuildingOfficeIconSolid, HomeModernIcon as HomeModernIconSolid, HomeIcon as HomeIconSolid, AcademicCapIcon as AcademicCapIconSolid, BookOpenIcon as BookOpenIconSolid, UserGroupIcon as UserGroupIconSolid, CalendarDaysIcon as CalendarDaysIconSolid, CalendarIcon as CalendarIconSolid, ClipboardDocumentCheckIcon as ClipboardDocumentCheckIconSolid, CurrencyDollarIcon as CurrencyDollarIconSolid, ClipboardDocumentListIcon as ClipboardDocumentListIconSolid } from '@heroicons/react/24/solid';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import RegisterModal from './RegisterModal';
import { isOwner, canManageUsers } from '../types/Role';

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Don't show sidebar on login page
  if (pathname === '/login') {
    return null;
  }

  const allNavigation = [
    { name: 'Аналитика', href: '/', icon: HomeIcon, activeIcon: HomeIconSolid, requireAuth: false, requireOwner: false, requireAdmin: false },
    { name: 'Организации', href: '/organizations', icon: BuildingOfficeIcon, activeIcon: BuildingOfficeIconSolid, requireAuth: true, requireOwner: true, requireAdmin: false },
    { name: 'Пользователи', href: '/students', icon: AcademicCapIcon, activeIcon: AcademicCapIconSolid, requireAuth: true, requireOwner: false, requireAdmin: false },
    { name: 'Кабинеты', href: '/rooms', icon: HomeModernIcon, activeIcon: HomeModernIconSolid, requireAuth: true, requireOwner: false, requireAdmin: false },
    { name: 'Предметы', href: '/subjects', icon: BookOpenIcon, activeIcon: BookOpenIconSolid, requireAuth: true, requireOwner: false, requireAdmin: false },
    { name: 'Группы', href: '/groups', icon: UserGroupIcon, activeIcon: UserGroupIconSolid, requireAuth: true, requireOwner: false, requireAdmin: true },
    { name: 'Шаблоны расписаний', href: '/schedules', icon: CalendarDaysIcon, activeIcon: CalendarDaysIconSolid, requireAuth: true, requireOwner: false, requireAdmin: true },
    { name: 'Календарь занятий', href: '/lessons', icon: CalendarIcon, activeIcon: CalendarIconSolid, requireAuth: true, requireOwner: false, requireAdmin: false },
    { name: 'Посещаемость', href: '/attendance', icon: ClipboardDocumentCheckIcon, activeIcon: ClipboardDocumentCheckIconSolid, requireAuth: true, requireOwner: false, requireAdmin: false },
    { name: 'Домашнее задание', href: '/homework', icon: ClipboardDocumentListIcon, activeIcon: ClipboardDocumentListIconSolid, requireAuth: true, requireOwner: false, requireAdmin: false },
    { name: 'Платежи', href: '/payments', icon: CurrencyDollarIcon, activeIcon: CurrencyDollarIconSolid, requireAuth: true, requireOwner: false, requireAdmin: false },
  ];

  // Filter navigation based on authentication status and role
  let navigation = allNavigation;
  
  if (!isAuthenticated) {
    navigation = allNavigation.filter(item => !item.requireAuth);
  } else {
    // If authenticated, filter by role requirements
    navigation = allNavigation.filter(item => {
      if (!item.requireAuth) return true; // Public items always visible
      if (item.requireOwner && user) {
        return isOwner(user.role);
      }
      if (item.requireAdmin && user) {
        return canManageUsers(user.role);
      }
      return true; // Other auth-required items visible to all authenticated users
    });
  }

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Modern Bottom Navigation Bar - Mobile Only */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-t border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
        <div className="flex items-center justify-around py-2">
          {navigation.slice(0, 5).map((item) => {
            const active = isActive(item.href);
            const IconComponent = active ? item.activeIcon : item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center py-2 px-3 transition-all duration-300 hover:scale-105"
              >
                <div className={`p-2 rounded-xl transition-all duration-300 ${
                  active 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-110' 
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}>
                  <IconComponent className="h-5 w-5" />
                </div>
                <span className={`text-xs mt-1 transition-colors duration-300 ${
                  active ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Modern Desktop Sidebar */}
      <div className="hidden lg:flex lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-64 lg:flex-col transition-all duration-300 
                      bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg z-30">
        
        {/* Logo Section */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 shadow-sm">
              <AcademicCapIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TrackAcademy
            </span>
          </div>
        </div>
        
        {/* User Info Section */}
        {isAuthenticated && user && (
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 shadow-sm">
                <span className="text-white font-medium">
                  {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.fullName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.role}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Navigation Links */}
        <div className="flex-1 px-4 py-6 overflow-y-auto">
          <nav className="space-y-2">
            {navigation.map((item) => {
              const active = isActive(item.href);
              const IconComponent = active ? item.activeIcon : item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                    transform hover:scale-105 hover:shadow-sm
                    ${active 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <IconComponent
                    className={`mr-3 flex-shrink-0 h-5 w-5 transition-all duration-200 ${
                      active ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'
                    }`}
                  />
                  {item.name}
                  {active && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-white/80 animate-pulse"></div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Auth Section for non-authenticated users */}
        {!isAuthenticated && (
          <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <div className="space-y-2">
              <Link 
                href="/login"
                className="w-full flex items-center justify-center px-4 py-3 rounded-xl text-sm font-medium 
                         bg-gradient-to-r from-blue-500 to-purple-600 text-white transition-all duration-200 
                         hover:shadow-lg transform hover:scale-105"
              >
                Войти
              </Link>
              <button 
                onClick={() => setShowRegisterModal(true)}
                className="w-full flex items-center justify-center px-4 py-3 rounded-xl text-sm font-medium 
                         bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 transition-all duration-200 
                         hover:bg-gray-200 dark:hover:bg-gray-500 transform hover:scale-105"
              >
                Регистрация
              </button>
            </div>
          </div>
        )}
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
