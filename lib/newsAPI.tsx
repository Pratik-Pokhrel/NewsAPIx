import { NewsApiResponse, NewsArticle, SearchParams } from './types';

const API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY;

// NewsAPI.ai uses different base URLs for different endpoints
const BASE_URL = 'https://newsapi.ai/api/v1/article/getArticles';

if (!API_KEY) {
    throw new Error('NEXT_PUBLIC_NEWS_API_KEY is not defined in environment variables');
}

/**
 * Fetches the latest news articles.
 * param - limit : The maximum number of articles to return. Defaults to 20.
 * and returns A list of NewsArticle objects with the latest news.
 */
export async function fetchLatestNews(limit: number = 20): Promise<NewsArticle[]> {
    try {
        // NewsAPI.ai specific parameters
        const requestBody = {
            query: {
                $query: {
                    $and: [
                        {
                            // Search for articles in the categories of politics, technology and business
                            conceptUri: {
                                $and: [
                                    "http://en.wikipedia.org/wiki/Politics",
                                    "http://en.wikipedia.org/wiki/Technology",
                                    "http://en.wikipedia.org/wiki/Business"
                                ]
                            }
                        },
                        {
                            // Only search for English articles
                            lang: "eng"
                        }
                    ]
                }
            },
            resultType: "articles",
            articlesPage: 1,
            articlesCount: limit,
            articlesSortBy: "date",
            articlesArticleBodyLen: 1000,
            apiKey: API_KEY
        };


        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            next: { revalidate: 120 }, // Revalidate every 2 minutes
        });


        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();

        // Let's handle multiple possible response formats
        let articles: NewsArticle[] = [];

        if (data.articles && data.articles.results) {
            articles = data.articles.results;
        } else if (data.articles) {
            articles = Array.isArray(data.articles) ? data.articles : [];
        } else if (data.results) {
            articles = data.results;
        } else if (Array.isArray(data)) {
            articles = data;
        } else {
            console.warn('Unexpected response structure:', data);
            return [];
        }

        // Transform the raw NewsAPI.ai articles into a standardized NewsArticle format
        return articles.map(transformArticle).filter((a): a is NewsArticle => a !== null);
    } catch (error) {
        console.error('Error fetching latest news:', error);
        throw new Error(`Failed to fetch latest news: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}



/**
 * Searches for news articles by keywords.
 * param - query : The search query to perform.
 * param - limit : The maximum number of articles to return. Defaults to 20.
 * returns A list of NewsArticle objects that match the search query.
 */
export async function searchNewsByKeywords(query: string, limit: number = 20): Promise<NewsArticle[]> {
    try {
        const requestBody = {
            query: {
                $query: {
                    $and: [
                        {
                            // Search for the query in the title and body of the articles
                            $or: [
                                { title: query },
                                { body: query }
                            ]
                        },
                        {
                            // Only search for English articles
                            lang: "eng"
                        }
                    ]
                }
            },
            resultType: "articles",
            articlesPage: 1,
            articlesCount: limit,
            articlesSortBy: "rel",
            articlesArticleBodyLen: 1000,
            apiKey: API_KEY
        };


        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            cache: 'no-store', // Always fetch fresh data for searches
        });


        if (!response.ok) {
            const errorText = await response.text();
            console.error('Search API Error Response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();

        let articles: NewsArticle[] = [];

        // Handle different response formats
        if (data.articles && data.articles.results) {
            articles = data.articles.results;
        } else if (data.articles) {
            articles = Array.isArray(data.articles) ? data.articles : [];
        } else if (data.results) {
            articles = data.results;
        } else if (Array.isArray(data)) {
            articles = data;
        } else {
            console.warn('Unexpected search response structure:', data);
            return [];
        }

        // Transform the articles to the standard NewsArticle format
        return articles.map(transformArticle).filter((a): a is NewsArticle => a !== null);
    } catch (error) {
        console.error('Error searching news:', error);
        throw new Error(`Failed to search news: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}



/**
 * Fetches a single news article by its ID.
 * we'll need to fetch articles and find the matching one.
 * param - id is The ID of the news article to fetch.
 * and returns The matching news article, or null if none is found.
 */
export async function getNewsById(id: string): Promise<NewsArticle | null> {
    try {
        // Fetch articles and find the matching one
        const articles = await fetchLatestNews(100);
        const article = articles.find(article => article.uri === id || article.url?.includes(id));
        return article || null;
    } catch (error) {
        console.error('Error fetching news by ID:', error);
        return null;
    }
}

/**
 * Transforms a raw article object from NewsAPI.ai into a standardized NewsArticle
 * object. This function is necessary because NewsAPI.ai returns articles in different
 * formats depending on the endpoint and query parameters.
 *
 *  "article" is  A raw article object from NewsAPI.ai
 * and it returns A standardized/transformed NewsArticle object, or null if the article is invalid
 */
function transformArticle(article: any): NewsArticle | null {
    if (!article) return null;

    try {
        // NewsAPI.ai articles might have different field names
        const transformed: NewsArticle = {
            uuid: article.uri || article.id || article.uuid || `${Date.now()}-${Math.random()}`,
            title: article.title || article.headline || 'Untitled',
            description: article.body || article.description || article.summary || '',
            keywords: article.keywords || article.tags?.join(', ') || '',
            snippet: article.body?.substring(0, 300) || article.description?.substring(0, 300) || '',
            url: article.url || article.link || '#',
            image_url: article.image || article.urlToImage || article.multimedia?.[0]?.url || '',
            language: article.lang || article.language || 'eng',
            published_at: article.dateTime || article.publishedAt || article.date || new Date().toISOString(),
            source: article.source?.title || article.source?.name || article.source || 'Unknown Source',
            categories: article.categories || article.category ? [article.category] : [],
            relevance_score: article.relevance || article.score || 0,
        };

        return transformed;
    } catch (error) {
        console.error('Error transforming article:', error, 'Article:', article);
        return null;
    }
}
