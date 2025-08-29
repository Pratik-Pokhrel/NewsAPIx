// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import NavBar from '@/components/NavBar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NewsAPIx - Latest News and Updates',
  description: 'Stay updated with the latest news and breaking stories from around the world',
  keywords: 'news, breaking news, latest news, world news, technology, business',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        <NavBar />
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="bg-gray-800 text-white py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">NewsAPIx</h3>
              <p className="text-gray-400 text-sm">
                Stay informed with the latest news from around the world
              </p>
              <p className="text-gray-400 text-xs mt-4">
                © 2025 NewsAPIx. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}