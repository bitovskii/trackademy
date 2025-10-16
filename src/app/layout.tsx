import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '../components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TrackAcademy - Student Management System',
  description: 'A comprehensive student and organization management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <div className="flex">
            <Sidebar />
            <main className="flex-1 lg:ml-64 p-6">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
