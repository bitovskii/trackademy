'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { ToastProvider } from '../contexts/ToastContext';
import { useEffect } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    // Подавляем показ технических ошибок в консоли браузера
    // для ошибок, которые уже обработаны нашей toast системой
    const handleError = (event: ErrorEvent) => {
      // Если ошибка содержит понятное сообщение (не техническое), подавляем её показ в консоли
      if (event.message && !event.message.startsWith('HTTP error!') && 
          !event.message.includes('status:') && 
          event.message.length < 200) {
        event.preventDefault();
        return false;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Подавляем необработанные Promise rejections для toast ошибок
      if (event.reason?.message && !event.reason.message.startsWith('HTTP error!') && 
          !event.reason.message.includes('status:') && 
          event.reason.message.length < 200) {
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-500">
                <TopBar />
                <div className="flex">
                  <Sidebar />
                  <main className="flex-1 lg:ml-64 p-4 md:p-6 pb-20 lg:pb-6 pt-[84px] min-h-screen">
                    <div className="max-w-full mx-auto">
                      {children}
                    </div>
                  </main>
                </div>
              </div>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
