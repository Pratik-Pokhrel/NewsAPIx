import { NewsArticle } from '@/lib/types';

/**
 * Generates a SEO-friendly URL slug from a news article title
 */
export function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

/**
 * Truncates text to a specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) return text || '';
    return text.slice(0, maxLength) + '...';
}

/**
 * Extracts a readable domain name from a URL
 */
export function extractDomain(url: string): string {
    try {
        const domain = new URL(url).hostname;
        return domain.replace(/^www\./, '');
    } catch {
        return 'Unknown Source';
    }
}

/**
 * Validates if an image URL is likely to be valid
 */
export function isValidImageUrl(url: string): boolean {
    if (!url) return false;
    try {
        new URL(url);
        return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url) || url.includes('image');
    } catch {
        return false;
    }
}

/**
 * Gets the reading time estimate for an article
 */
export function getReadingTime(text: string): number {
    const wordsPerMinute = 200;
    const wordCount = text.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return Math.max(1, readingTime);
}

/**
 * Formats the reading time into a human-readable string
 */
export function formatReadingTime(minutes: number): string {
    if (minutes === 1) return '1 min read';
    return `${minutes} min read`;
}

/**
 * Generates metadata for a news article page
 */
export function generateArticleMetadata(article: NewsArticle) {
    return {
        title: `${article.title} - NewsAPIx`,
        description: truncateText(article.description || article.snippet, 160),
        openGraph: {
            title: article.title,
            description: truncateText(article.description || article.snippet, 160),
            images: article.image_url ? [{ url: article.image_url }] : [],
            type: 'article',
            publishedTime: article.published_at,
            authors: [article.source],
        },
        twitter: {
            card: 'summary_large_image',
            title: article.title,
            description: truncateText(article.description || article.snippet, 160),
            images: article.image_url ? [article.image_url] : [],
        },
    };
}

/**
 * Formats search query for display
 */
export function formatSearchQuery(query: string): string {
    return query.trim().replace(/\s+/g, ' ');
}

/**
 * Validates search query
 */
export function isValidSearchQuery(query: string): boolean {
    const trimmed = query.trim();
    return trimmed.length >= 2 && trimmed.length <= 100;
}
