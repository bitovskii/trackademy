'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BuildingOfficeIcon, HomeModernIcon, HomeIcon, UserCircleIcon, AcademicCapIcon, BookOpenIcon, ArrowRightEndOnRectangleIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { BuildingOfficeIcon as BuildingOfficeIconSolid, HomeModernIcon as HomeModernIconSolid, HomeIcon as HomeIconSolid, UserCircleIcon as UserCircleIconSolid, AcademicCapIcon as AcademicCapIconSolid, BookOpenIcon as BookOpenIconSolid } from '@heroicons/react/24/solid';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import RegisterModal from './RegisterModal';
import ThemeToggle from './ThemeToggle';

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { isAuthenticated, logout, user } = useAuth();
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
      {/* Modern Bottom Navigation Bar - Mobile Only */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass-card border-t" 
           style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-around py-2">
          {navigation.slice(0, 5).map((item) => {
            const active = isActive(item.href);
            const IconComponent = active ? item.activeIcon : item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center py-2 px-3 transition-all duration-300 hover-lift"
              >
                <div className={`p-2 rounded-xl transition-all duration-300 ${
                  active 
                    ? 'shadow-lg' 
                    : 'opacity-70'
                }`}
                style={{ 
                  background: active ? 'var(--gradient-warm)' : 'transparent',
                  color: active ? 'white' : 'var(--muted-foreground)'
                }}>
                  <IconComponent className="h-5 w-5" />
                </div>
                <span className={`text-xs mt-1 transition-colors duration-300 ${
                  active ? 'font-medium' : ''
                }`}
                style={{ color: active ? 'var(--primary)' : 'var(--muted-foreground)' }}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Modern Desktop Sidebar */}
      <div className="hidden lg:flex lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-64 lg:flex-col transition-all duration-300"
           style={{ 
             background: 'var(--card)',
             borderRight: '1px solid var(--border)',
             boxShadow: 'var(--shadow-lg)'
           }}>
        
        {/* Logo Section */}
        <div className="flex items-center justify-between h-16 px-6"
             style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                 style={{ background: 'var(--gradient-cool)' }}>
              <AcademicCapIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">TrackAcademy</span>
          </div>
        </div>
        
        {/* User Info Section */}
        {isAuthenticated && user && (
          <div className="px-6 py-4"
               style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                   style={{ background: 'var(--gradient-cool)' }}>
                <span className="text-white font-medium">
                  {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>
                  {user.fullName}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
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
                    group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 hover-lift
                    ${active ? 'shadow-md' : ''}
                  `}
                  style={{
                    background: active ? 'var(--gradient-cool)' : 'transparent',
                    color: active ? 'white' : 'var(--foreground)'
                  }}
                >
                  <IconComponent
                    className={`mr-3 flex-shrink-0 h-5 w-5 transition-all duration-300 ${
                      active ? 'text-white' : ''
                    }`}
                    style={{ color: active ? 'white' : 'var(--muted-foreground)' }}
                  />
                  {item.name}
                  {active && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-white opacity-80"></div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Theme Toggle & Auth Section */}
        <div className="px-4 py-4 space-y-4"
             style={{ borderTop: '1px solid var(--border)' }}>
          
          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
              Тема
            </span>
            <ThemeToggle />
          </div>

          {/* Auth Buttons */}
          {isAuthenticated ? (
            <button 
              onClick={logout}
              className="w-full flex items-center justify-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover-lift"
              style={{ 
                background: 'var(--secondary)',
                color: 'white'
              }}
            >
              <ArrowRightEndOnRectangleIcon className="h-5 w-5 mr-2" />
              Выйти
            </button>
          ) : (
            <div className="space-y-2">
              <Link 
                href="/login"
                className="w-full flex items-center justify-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover-lift"
                style={{ 
                  background: 'var(--gradient-cool)',
                  color: 'white'
                }}
              >
                <ArrowRightEndOnRectangleIcon className="h-5 w-5 mr-2" />
                Войти
              </Link>
              <button 
                onClick={() => setShowRegisterModal(true)}
                className="w-full flex items-center justify-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover-lift btn-secondary"
              >
                <UserPlusIcon className="h-5 w-5 mr-2" />
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