'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getNewsById, fetchLatestNews } from '@/lib/newsAPI';
import { NewsArticle } from '@/lib/types';
import { formatFullDate } from '@/utils/dateFormatter';
import { getReadingTime, formatReadingTime, extractDomain } from '@/utils/newsHelpers';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function NewsDetailPage() {
    const [article, setArticle] = useState<NewsArticle | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [imageError, setImageError] = useState(false);

    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    useEffect(() => {
        async function fetchArticle() {
            if (!id) {
                setError('No article ID provided');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // First try to get the article by ID
                let foundArticle = await getNewsById(id);

                // If not found by ID, try to find it in the latest articles by UUID
                if (!foundArticle) {
                    const latestArticles = await fetchLatestNews(100);
                    foundArticle = latestArticles.find(article =>
                        article.uuid === id ||
                        article.url?.includes(id) ||
                        article.uri === id
                    ) || null;
                }

                if (foundArticle) {
                    setArticle(foundArticle);
                } else {
                    setError('Article not found');
                }
            } catch (err) {
                console.error('Error fetching article:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch article');
            } finally {
                setLoading(false);
            }
        }

        fetchArticle();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <div className="mx-auto h-12 w-12 text-red-400 mb-4">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.862-.833-2.632 0L4.182 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Article Not Found</h1>
                        <p className="text-gray-600 mb-6">
                            {error || 'The article you\'re looking for doesn\'t exist or has been removed.'}
                        </p>
                        <div className="space-x-4">
                            <button
                                onClick={() => router.back()}
                                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                                Go Back
                            </button>
                            <Link
                                href="/"
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <nav className="flex items-center space-x-4 text-sm">
                        <Link href="/" className="text-blue-600 hover:text-blue-800">
                            Home
                        </Link>
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="text-gray-500">Article</span>
                    </nav>
                </div>
            </div>

            {/* Article Content */}
            <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Article Header */}
                    <div className="px-6 sm:px-8 py-6">
                        {/* Categories */}
                        {article.categories && article.categories.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {article.categories.map((category, index) => (
                                    <span
                                        key={index}
                                        className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium"
                                    >
                                        {category}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Title */}
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4">
                            {article.title}
                        </h1>

                        {/* Meta Information */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 mb-6 space-y-2 sm:space-y-0">
                            <div className="flex items-center space-x-4">
                                <span className="font-medium text-gray-900">{article.source}</span>
                                <span>•</span>
                                <time>{formatFullDate(article.published_at)}</time>
                                <span>•</span>
                                <span>{formatReadingTime(getReadingTime(article.description || article.snippet))}</span>
                            </div>
                            {article.relevance_score > 0 && (
                                <div className="flex items-center">
                                    <span className="text-xs text-gray-500">
                                        Relevance: {Math.round(article.relevance_score * 100)}%
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Keywords */}
                        {article.keywords && (
                            <div className="mb-6">
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Keywords:</span> {article.keywords}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Article Image */}
                    {article.image_url && !imageError && (
                        <div className="relative h-64 sm:h-96 w-full">
                            <Image
                                src={article.image_url}
                                alt={article.title}
                                fill
                                className="object-cover"
                                onError={() => setImageError(true)}
                                unoptimized
                            />
                        </div>
                    )}

                    {/* Article Body */}
                    <div className="px-6 sm:px-8 py-6">
                        {/* Description/Content */}
                        <div className="prose max-w-none">
                            <p className="text-lg text-gray-700 leading-relaxed mb-6">
                                {article.description || article.snippet}
                            </p>
                        </div>

                        {/* Original Article Link */}
                        {article.url && article.url !== '#' && (
                            <div className="border-t border-gray-200 pt-6 mt-8">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            Read Full Article
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Continue reading on {extractDomain(article.url)}
                                        </p>
                                    </div>
                                    <a
                                        href={article.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                    >
                                        Read More
                                        <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center justify-center px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                    >
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Go Back
                    </button>

                    <Link
                        href="/"
                        className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    >
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Back to Home
                    </Link>
                </div>
            </article>
        </div>
    );
}
