'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-500">
              <TopBar />
              <div className="flex">
                <Sidebar />
                <main className="flex-1 lg:ml-64 p-4 md:p-6 pb-20 lg:pb-6 pt-20 min-h-screen">
                  <div className="max-w-full mx-auto">
                    {children}
                  </div>
                </main>
              </div>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
