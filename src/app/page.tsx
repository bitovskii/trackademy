'use client';

import { useState, useEffect } from 'react';
import { AcademicCapIcon, BuildingOfficeIcon, HomeModernIcon, BookOpenIcon, UserGroupIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: BuildingOfficeIcon,
      title: 'Управление организациями',
      description: 'Создавайте и управляйте образовательными организациями',
      href: '/organizations',
      color: 'from-sky-500 to-blue-600',
      delay: '0.1s'
    },
    {
      icon: HomeModernIcon,
      title: 'Кабинеты и аудитории',
      description: 'Организуйте пространство для эффективного обучения',
      href: '/rooms',
      color: 'from-blue-500 to-purple-500',
      delay: '0.2s'
    },
    {
      icon: BookOpenIcon,
      title: 'Предметы и курсы',
      description: 'Структурируйте учебные программы и дисциплины',
      href: '/subjects',
      color: 'from-purple-500 to-violet-500',
      delay: '0.3s'
    },
    {
      icon: UserGroupIcon,
      title: 'Студенты и преподаватели',
      description: 'Управляйте участниками образовательного процесса',
      href: '/students',
      color: 'from-violet-500 to-cyan-500',
      delay: '0.4s'
    }
  ];

  const stats = [
    { label: 'Активных организаций', value: '25+', icon: BuildingOfficeIcon },
    { label: 'Учебных кабинетов', value: '150+', icon: HomeModernIcon },
    { label: 'Предметов', value: '80+', icon: BookOpenIcon },
    { label: 'Пользователей', value: '500+', icon: UserGroupIcon }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full opacity-20 animate-float" 
             style={{ background: 'var(--gradient-cool)' }}></div>
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full opacity-15 animate-float" 
             style={{ background: 'var(--gradient-cool)', animationDelay: '1s' }}></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className={`text-center max-w-4xl transition-all duration-1000 ${isVisible ? 'animate-slide-in-up' : 'opacity-0'}`}>
          {/* Logo/Icon */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl hover-lift"
                   style={{ background: 'var(--gradient-cool)' }}>
                <AcademicCapIcon className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="gradient-text">TrackAcademy</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
            Современная система управления образовательным учреждением
          </p>

          {/* Auth Status */}
          {isAuthenticated ? (
            <div className="mb-8 p-4 rounded-lg glass-card inline-block">
              <p className="text-lg">
                Добро пожаловать, <span className="font-semibold gradient-text">{user?.fullName}</span>!
              </p>
            </div>
          ) : (
            <div className="mb-8">
              <Link href="/login" className="btn-primary mr-4 inline-block">
                Войти в систему
              </Link>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/organizations" className="btn-primary hover-lift">
              Начать работу
            </Link>
            <Link href="/students" className="btn-secondary hover-lift">
              Просмотреть демо
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl transition-all duration-1000 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}
             style={{ animationDelay: '0.5s' }}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.title}
                href={feature.href}
                className="card hover-lift group transition-all duration-300"
                style={{ animationDelay: feature.delay }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                  {feature.title}
                </h3>
                <p style={{ color: 'var(--muted-foreground)' }}>
                  {feature.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'animate-slide-in-up' : 'opacity-0'}`}
               style={{ animationDelay: '0.8s' }}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="gradient-text">Цифры говорят за нас</span>
            </h2>
            <p className="text-lg" style={{ color: 'var(--muted-foreground)' }}>
              Доверие образовательных учреждений по всей стране
            </p>
          </div>

          <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 transition-all duration-1000 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}
               style={{ animationDelay: '1s' }}>
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center card hover-lift">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center"
                       style={{ background: 'var(--gradient-cool)' }}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold mb-2 gradient-text">
                    {stat.value}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className={`card glass-card transition-all duration-1000 ${isVisible ? 'animate-slide-in-up' : 'opacity-0'}`}
               style={{ animationDelay: '1.2s' }}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Готовы начать?
            </h2>
            <p className="text-lg mb-8" style={{ color: 'var(--muted-foreground)' }}>
              Присоединяйтесь к сотням образовательных учреждений, которые доверяют TrackAcademy
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/organizations" className="btn-primary hover-lift">
                Начать бесплатно
              </Link>
              <Link href="/login" className="btn-secondary hover-lift">
                Войти в аккаунт
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
