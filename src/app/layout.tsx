'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '../components/Sidebar';
import { AuthProvider } from '../contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-white">
            <div className="flex">
              <Sidebar />
              <main className="flex-1 lg:ml-64 p-6 pb-20 lg:pb-6">
                {children}
              </main>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
