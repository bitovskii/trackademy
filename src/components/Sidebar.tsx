'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BuildingOfficeIcon, Bars3Icon, XMarkIcon, HomeModernIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Организации', href: '/organizations', icon: BuildingOfficeIcon },
    { name: 'Кабинеты', href: '/rooms', icon: HomeModernIcon },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 bg-white shadow-md"
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <button 
          className="lg:hidden fixed inset-0 z-40 bg-gray-600 bg-opacity-75 border-none p-0 m-0 cursor-default" 
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Закрыть меню"
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-screen w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out z-40
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
          <span className="text-xl font-bold text-blue-600">TrackAcademy</span>
        </div>
        
        {/* Navigation Links */}
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
                    ${isActive(item.href)
                      ? 'bg-blue-100 text-blue-900 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon
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

        {/* Sign In Button at Bottom */}
        <div className="flex-shrink-0 border-t border-gray-200 p-4">
          <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
            Войти
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;