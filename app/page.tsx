import { fetchLatestNews } from '@/lib/newsAPI';
import NewsList from '@/components/NewsList';
import { NewsArticle } from '@/lib/types';

// Force dynamic rendering to always fetch fresh data on startup
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  let articles: NewsArticle[] = [];
  let error: string | null = null;

  try {
    articles = await fetchLatestNews(30);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to fetch news';
    console.error('Error fetching latest news:', err);
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-md p-6">
            <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-red-800">Error Loading News</h3>
            <p className="mt-1 text-sm text-red-600">{error}</p>
            <p className="mt-2 text-xs text-red-500">
              Please check your API key configuration and try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              Latest News
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Stay updated with breaking news and stories from around the world
            </p>
          </div>
        </div>
      </div>

      {/* News Articles */}
      <NewsList
        articles={articles}
        emptyMessage="No news articles available at the moment. Please try again later."
      />
    </div>
  );
}