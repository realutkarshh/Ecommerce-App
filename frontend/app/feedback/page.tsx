// app/feedback/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@/app/context/user-context';
import { getFeedbackEligibility, submitFeedback } from '@/lib/api';
import Image from 'next/image';

interface EligibleProduct {
  _id: string;
  name: string;
  image: string;
  orderId: string;
}

export default function FeedbackPage() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  
  const [eligibleProducts, setEligibleProducts] = useState<EligibleProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchEligibleProducts = async () => {
      if (!user?.token) {
        setLoading(false);
        return;
      }

      try {
        const eligibleOrders = await getFeedbackEligibility(user.token);
        
        // Flatten products from all eligible orders
        const products: EligibleProduct[] = [];
        eligibleOrders.forEach(order => {
          order.items.forEach((item: any) => {
            products.push({
              _id: item.product._id,
              name: item.product.name,
              image: item.product.image,
              orderId: order._id
            });
          });
        });
        
        // Filter by specific order if orderId is provided
        const filteredProducts = orderId 
          ? products.filter(p => p.orderId === orderId)
          : products;
          
        setEligibleProducts(filteredProducts);
        
        if (filteredProducts.length === 1) {
          setSelectedProduct(filteredProducts[0]._id);
        }
      } catch (error) {
        console.error('Error fetching eligible products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEligibleProducts();
  }, [user, orderId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) {
      alert('Please select a product');
      return;
    }

    if (!user?.token) {
      alert('Please login to submit feedback');
      return;
    }

    try {
      setSubmitting(true);
      
      const selectedProductData = eligibleProducts.find(p => p._id === selectedProduct);
      
      await submitFeedback({
        order: selectedProductData?.orderId || '',
        product: selectedProduct,
        rating,
        comment
      }, user.token);

      setSubmitted(true);
      
      // Redirect after showing success message
      setTimeout(() => {
        router.push('/orders');
      }, 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-32 h-32 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-16 h-16 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Login Required</h1>
          <p className="text-gray-600 mb-8">Please log in to submit your feedback</p>
          <button
            onClick={() => router.push('/login')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 px-8 rounded-2xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] bg-gradient-to-br from-slate-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-600">Loading feedback form...</p>
        </div>
      </div>
    );
  }

  if (eligibleProducts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">No Products for Feedback</h1>
          <p className="text-gray-600 mb-8">You can only provide feedback for delivered orders. Complete an order first!</p>
          <button
            onClick={() => router.push('/orders')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 px-8 rounded-2xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            View Orders
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-16 h-16 text-green-500" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Thank You!</h1>
          <p className="text-gray-600 mb-8">Your feedback has been submitted successfully. We appreciate your time and input!</p>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-white/20">
            <p className="text-sm text-gray-600">Redirecting to your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Share Your Experience</h1>
          <p className="text-gray-600">Your feedback helps us serve you better</p>
        </div>

        {/* Feedback Form */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Product Selection */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  Which product would you like to review?
                </label>
                {eligibleProducts.length === 1 ? (
                  <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-gray-50 to-orange-50 rounded-2xl border border-orange-200">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white shadow-sm">
                      <Image
                        src={eligibleProducts[0].image}
                        alt={eligibleProducts[0].name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg">{eligibleProducts[0].name}</h3>
                      <p className="text-gray-600 text-sm">From your recent order</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {eligibleProducts.map((product) => (
                      <label 
                        key={product._id} 
                        className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200 border-2 ${
                          selectedProduct === product._id 
                            ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-red-50 shadow-lg' 
                            : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-md'
                        }`}
                      >
                        <input
                          type="radio"
                          name="product"
                          value={product._id}
                          checked={selectedProduct === product._id}
                          onChange={(e) => setSelectedProduct(e.target.value)}
                          className="w-5 h-5 text-orange-500 border-gray-300 focus:ring-orange-500"
                        />
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white shadow-sm">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{product.name}</h3>
                          <p className="text-gray-600 text-sm">Order #{product.orderId.slice(-6)}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Rating */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  How would you rate this product?
                </label>
                <div className="flex items-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-4xl transition-all duration-200 hover:scale-110 ${
                        star <= rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    rating >= 4 ? 'bg-green-100 text-green-800' :
                    rating >= 3 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {rating} Star{rating !== 1 ? 's' : ''}
                  </div>
                  <span className="text-gray-600 text-sm">
                    {rating >= 4 ? 'Great!' : rating >= 3 ? 'Good' : 'Needs improvement'}
                  </span>
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  Tell us more about your experience (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={5}
                  placeholder="What did you love about this product? Any suggestions for improvement?"
                  className="w-full p-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 resize-none text-gray-900"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Your detailed feedback helps us improve our products and service
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting || !selectedProduct}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-200 hover:scale-105 disabled:hover:scale-100 shadow-lg disabled:shadow-none"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting Feedback...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Submit Feedback
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/orders')}
                  className="sm:w-auto px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 hover:scale-105"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Additional Info */}
          <div className="mt-8 bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Why your feedback matters</h3>
                <p className="text-gray-600 text-sm">
                  Your reviews help other customers make informed decisions and help us continuously improve our products and service quality.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
