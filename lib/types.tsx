export interface NewsArticle {
    uuid: string;
    title: string;
    description: string;
    keywords: string;
    snippet: string;
    url: string;
    image_url: string;
    language: string;
    published_at: string;
    source: string;
    categories: string[];
    relevance_score: number;
    uri?: string;
}

export interface NewsApiResponse {
    meta?: {
        found: number;
        returned: number;
        limit: number;
        page: number;
    };
    data?: NewsArticle[];
    articles?: {
        results: any[];
    } | any[];
    results?: any[];
}

export interface SearchParams {
    q?: string;
    page?: number;
    limit?: number;
    categories?: string;
    language?: string;
}