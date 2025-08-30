
import { NewsArticle } from '@/lib/types';
import NewsCard from './NewsCard';

interface NewsListProps {
    articles: NewsArticle[];
    title?: string;
    emptyMessage?: string;
}

const NewsList: React.FC<NewsListProps> = ({
    articles,
    title,
    emptyMessage = 'No news articles found.'
}) => {

    if (!articles || !Array.isArray(articles) || articles.length === 0) {
        return (
            <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No articles</h3>
                <p className="mt-1 text-sm text-gray-500">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {title && (
                <h2 className="text-2xl font-bold text-gray-900 mb-8">{title}</h2>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.filter(article => article != null).map((article, index) => (
                    <NewsCard
                        key={article.uuid || article.url || `article-${index}`}
                        article={article}
                    />
                ))}
            </div>
        </div>
    );
};

export default NewsList;