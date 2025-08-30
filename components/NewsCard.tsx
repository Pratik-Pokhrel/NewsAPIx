'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { NewsArticle } from '@/lib/types';
import { formatDate } from '@/utils/dateFormatter';

interface NewsCardProps {
    article: NewsArticle;
}

const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
    const [imageError, setImageError] = useState(false);

    if (!article) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-500">Article data not available</p>
            </div>
        );
    }

    /**
     * Truncates a string to a given maximum length and appends an ellipsis if the string is longer than the maximum length.
     * returns The truncated string
     */
    
    const truncateText = (text: string, maxLength: number): string => {
        if (!text || text.length <= maxLength) return text || '';
        return text.slice(0, maxLength) + '...';
    };


    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            <Link href={`/news/detail/${article.uuid}`}>
                <div className="cursor-pointer">

                    {/* Image of the article ----> HERE */}
                    <div className="relative h-48 w-full">
                        {article.image_url && !imageError ? (
                            <Image
                                src={article.image_url}
                                alt={article.title || 'News image'}
                                fill
                                className="object-cover"
                                onError={() => setImageError(true)}
                                unoptimized
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center relative">
                                <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-gray-500 text-sm absolute bottom-2">No Image Available</span>
                            </div>
                        )}
                    </div>


                    {/* Source and Date of the Article ----> HERE */}
                    <div className="p-6">
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                            <span className="font-medium">{article.source || 'Unknown Source'}</span>
                            <span>{formatDate(article.published_at)}</span>
                        </div>


                        {/* Title of the Article ----> HERE */}
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                            {truncateText(article.title || 'Untitled', 100)}
                        </h3>


                        {/* Description of the Article ----> HERE*/}
                        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                            {truncateText(article.description || article.snippet || 'No description available', 150)}
                        </p>


                        {/* Categories of the Article ----> HERE */}
                        {article.categories && article.categories.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {article.categories.slice(0, 3).map((category, index) => (
                                    <span
                                        key={index}
                                        className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                                    >
                                        {category}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Read More Link */}
                        <div className="flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm">
                            Read more
                            <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default NewsCard;