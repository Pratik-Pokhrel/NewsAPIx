'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

const NavBar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const router = useRouter();

  // Here is the search parameter q , whose value is extracted in .\search\page.tsx
  const handleSearch = () => {
    if (searchTerm.trim()) {
      router.push(`/news/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 shadow-2xl border-b border-purple-500/20 sticky top-0 z-50 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 group">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 p-0.5 transition-all duration-300 group-hover:scale-105 transform group-hover:shadow-lg group-hover:shadow-cyan-500/25">
                <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center">
                  <Image
                    src="/logo.png"
                    alt="NewsAPIx Logo"
                    width={32}
                    height={32}
                    className="rounded-full transition-all duration-300"
                    priority
                  />
                </div>
              </div>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-purple-400 group-focus-within:text-cyan-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="block w-full pl-10 pr-3 py-2 border border-purple-500/30 rounded-lg leading-5 bg-slate-800/50 backdrop-blur-sm placeholder-gray-400 text-white focus:outline-none focus:placeholder-gray-300 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 sm:text-sm transition-all duration-200 hover:bg-slate-800/70 hover:border-purple-400/50"
                placeholder="Search news by keywords..."
              />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
            </div>
          </div>

          {/* Search Button */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleSearch}
              disabled={!searchTerm.trim()}
              className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-semibold rounded-lg shadow-lg text-white bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:scale-105 transform active:scale-95"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
export default NavBar;