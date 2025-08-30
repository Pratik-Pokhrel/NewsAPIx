
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Loading() {
    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <h2 className="mt-4 text-lg font-medium text-gray-900">Loading news articles...</h2>
                    <p className="mt-2 text-sm text-gray-500">Please wait while we fetch the latest news for you.</p>
                </div>
            </div>
        </div>
    );
}