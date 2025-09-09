// app/feedback/page.tsx
import { Suspense } from 'react';
import FeedbackForm from './feedback-form';

function FeedbackLoading() {
  return (
    <div className="min-h-[calc(100vh-200px)] bg-gradient-to-br from-slate-50 to-orange-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg font-medium text-gray-600">Loading feedback form...</p>
      </div>
    </div>
  );
}

export default function FeedbackPage() {
  return (
    <Suspense fallback={<FeedbackLoading />}>
      <FeedbackForm />
    </Suspense>
  );
}
