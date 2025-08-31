import { NewsArticle } from './types';

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
            cache: 'no-store', // Disable caching to always fetch fresh data
        });


        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();

        // Let's handle multiple possible response formats
        let rawArticles: unknown[] = [];

        if (data.articles && data.articles.results) {
            rawArticles = data.articles.results;
        } else if (data.articles) {
            rawArticles = Array.isArray(data.articles) ? data.articles : [];
        } else if (data.results) {
            rawArticles = data.results;
        } else if (Array.isArray(data)) {
            rawArticles = data;
        } else {
            console.warn('Unexpected response structure:', data);
            return [];
        }

        // Transform the raw NewsAPI.ai articles into a standardized NewsArticle format
        return rawArticles.map(transformArticle).filter((a): a is NewsArticle => a !== null);
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
        // Use NewsAPI.ai search syntax with keyword search
        const requestBody = {
            query: {
                $query: {
                    $and: [
                        {
                            // Search in title and body using keyword
                            keyword: query
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
            articlesCount: Math.min(limit, 50), // Limit to prevent memory issues
            articlesSortBy: "rel", // Sort by relevance for search
            articlesArticleBodyLen: 1000,
            apiKey: API_KEY
        };

        console.log('Search request body:', JSON.stringify(requestBody, null, 2)); // Debug log

        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            cache: 'no-store',
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Search API Error:', response.status, errorText);

            // If keyword search fails, try a fallback approach
            return await fallbackSearch(query, limit);
        }

        const data = await response.json();
        console.log('Search response:', data); // Debug log

        let rawArticles: unknown[] = [];
        if (data.articles && data.articles.results) {
            rawArticles = data.articles.results;
        } else if (data.articles) {
            rawArticles = Array.isArray(data.articles) ? data.articles : [];
        } else if (data.results) {
            rawArticles = data.results;
        } else if (Array.isArray(data)) {
            rawArticles = data;
        }

        if (rawArticles.length === 0) {
            console.log('No results from API search, trying fallback search');
            return await fallbackSearch(query, limit);
        }

        return rawArticles.map(transformArticle).filter((a): a is NewsArticle => a !== null);

    } catch (error) {
        console.error('Error searching news:', error);
        // Try fallback search if main search fails
        return await fallbackSearch(query, limit);
    }
}

/**
 * Fallback search that fetches latest news and filters locally
 */
async function fallbackSearch(query: string, limit: number): Promise<NewsArticle[]> {
    try {
        console.log('Using fallback search for:', query);

        // Fetch latest articles and search locally
        const allArticles = await fetchLatestNews(100);
        const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 1);

        const matchingArticles = allArticles.filter(article => {
            const searchableText = [
                article.title,
                article.description,
                article.snippet,
                article.keywords,
                article.source
            ].join(' ').toLowerCase();

            // Check if any search term is found in the article
            return searchTerms.some(term => searchableText.includes(term));
        });

        // Sort by relevance (how many search terms match)
        const scoredArticles = matchingArticles.map(article => {
            const searchableText = [
                article.title,
                article.description,
                article.snippet,
                article.keywords,
                article.source
            ].join(' ').toLowerCase();

            let score = 0;
            searchTerms.forEach(term => {
                // Count occurrences of each term
                const matches = (searchableText.match(new RegExp(term, 'gi')) || []).length;
                score += matches;

                // Give extra weight to title matches
                if (article.title.toLowerCase().includes(term)) {
                    score += 2;
                }
            });

            return { article, score };
        });

        // Sort by score (relevance) and limit results
        const results = scoredArticles
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(item => item.article);

        console.log(`Fallback search found ${results.length} results`);
        return results;

    } catch (error) {
        console.error('Fallback search error:', error);
        return [];
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
        // Fetch latest articles with a reasonable limit to prevent memory issues
        const latestArticles = await fetchLatestNews(50); // Reduced from 100
        const article = latestArticles.find(article =>
            article.uuid === id ||
            article.uri === id ||
            article.url?.includes(id)
        );

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
/**
 * Transforms a raw article object from NewsAPI.ai into a standardized NewsArticle
 * object. This function is necessary because NewsAPI.ai returns articles in different
 * formats depending on the endpoint and query parameters.
 *
 *  "article" is  A raw article object from NewsAPI.ai
 * and it returns A standardized/transformed NewsArticle object, or null if the article is invalid
 */
/**
 * Transforms a raw article object from NewsAPI.ai into a standardized NewsArticle
 * object. This function is necessary because NewsAPI.ai returns articles in different
 * formats depending on the endpoint and query parameters.
 *
 *  "article" is  A raw article object from NewsAPI.ai
 * and it returns A standardized/transformed NewsArticle object, or null if the article is invalid
 */
function transformArticle(article: unknown): NewsArticle | null {
    if (!article || typeof article !== 'object') return null;

    const articleObj = article as Record<string, unknown>;

    try {
        // NewsAPI.ai articles might have different field names
        const transformed: NewsArticle = {
            uuid: (articleObj.uri as string) || (articleObj.id as string) || (articleObj.uuid as string) || `${Date.now()}-${Math.random()}`,
            title: (articleObj.title as string) || (articleObj.headline as string) || 'Untitled',
            description: (articleObj.body as string) || (articleObj.description as string) || (articleObj.summary as string) || '',
            keywords: (articleObj.keywords as string) || (articleObj.tags as string[])?.join(', ') || '',
            snippet: (articleObj.body as string)?.substring(0, 300) || (articleObj.description as string)?.substring(0, 300) || '',
            url: (articleObj.url as string) || (articleObj.link as string) || '#',
            image_url: (articleObj.image as string) || (articleObj.urlToImage as string) || (articleObj.multimedia as { url?: string }[])?.[0]?.url || '',
            language: (articleObj.lang as string) || (articleObj.language as string) || 'eng',
            published_at: (articleObj.dateTime as string) || (articleObj.publishedAt as string) || (articleObj.date as string) || new Date().toISOString(),
            source: (articleObj.source as { title?: string; name?: string })?.title || (articleObj.source as { title?: string; name?: string })?.name || (articleObj.source as string) || 'Unknown Source',
            categories: (articleObj.categories as string[]) || (articleObj.category ? [articleObj.category as string] : []),
            relevance_score: (articleObj.relevance as number) || (articleObj.score as number) || 0,
        };

        return transformed;
    } catch (error) {
        console.error('Error transforming article:', error, 'Article:', article);
        return null;
    }
}
