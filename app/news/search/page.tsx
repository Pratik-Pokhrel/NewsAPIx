'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchNewsByKeywords } from '@/lib/newsAPI';
import { NewsArticle } from '@/lib/types';
import NewsList from '@/components/NewsList';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function SearchPage() {
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchParams = useSearchParams();

    // Get the query parameter from URL (set by NavBar search)
    const query = searchParams.get('q') || '';

    // Function to perform search
    const performSearch = useCallback(async (searchTerm: string) => {
        if (!searchTerm.trim()) {
            setArticles([]);
            return;
        }

        console.log('Searching for:', searchTerm); // Debug log
        setLoading(true);
        setError(null);

        try {
            const results = await searchNewsByKeywords(searchTerm, 30);
            setArticles(results);
        } catch (err) {
            console.error('Search error:', err);
            setError(err instanceof Error ? err.message : 'Failed to search news articles');
            setArticles([]);
        } finally {
            setLoading(false);
        }
    }, []);


    // Effect to search when query parameter changes (from NavBar)
    useEffect(() => {
        if (query) {
            performSearch(query);
        } else {
            setArticles([]);
        }
    }, [query, performSearch]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Search Results Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Search Results</h1>

                    {/* Search Info */}
                    {query && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                {loading ? (
                                    'Searching...'
                                ) : error ? (
                                    <span className="text-red-600">Error occurred while searching</span>
                                ) : (
                                    `Search results for "${query}" (${articles.length} ${articles.length === 1 ? 'article' : 'articles'} found)`
                                )}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Search Results */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <LoadingSpinner />
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <div className="mx-auto h-12 w-12 text-red-400 mb-4">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.862-.833-2.632 0L4.182 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Search Error</h3>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={() => performSearch(query)}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Try Again
                        </button>
                    </div>
                ) : !query ? (
                    <div className="text-center py-12">
                        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Search Query</h3>
                        <p className="text-gray-600">Use the search bar in the navigation above to find news articles.</p>
                    </div>
                ) : articles.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.007-5.824-2.562M15 6.306a7.962 7.962 0 00-6 0M2 9a8 8 0 1116 0v5.172a2 2 0 01-.586 1.414L16 17H8l-1.414-1.414A2 2 0 016 14.172V9z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
                        <p className="text-gray-600 mb-4">
                            We couldn&apos;t find any articles matching &quot;{query}&quot;. Try different keywords or check your spelling.
                        </p>
                        <div className="space-y-2 text-sm text-gray-500">
                            <p>Search tips:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Try broader or more general terms</li>
                                <li>Check spelling and try synonyms</li>
                                <li>Use fewer keywords</li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    <NewsList
                        articles={articles}
                        emptyMessage={`No articles found for "${query}"`}
                    />
                )}
            </div>
        </div>
    );
}