import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'News - NewsAPIx',
    description: 'Browse and search the latest news articles from around the world',
};

export default function NewsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50">
            {children}
        </div>
    );
}
