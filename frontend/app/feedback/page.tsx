// app/feedback/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@/app/context/user-context';
import { getFeedbackEligibility, submitFeedback } from '@/lib/api';

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

      alert('Thank you for your feedback!');
      router.push('/orders');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow text-center">
        <h1 className="text-2xl font-bold mb-4">Please Login</h1>
        <p className="mb-4">You need to be logged in to submit feedback.</p>
        <button
          onClick={() => router.push('/login')}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-8">Loading feedback form...</div>;
  }

  if (eligibleProducts.length === 0) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow text-center">
        <h1 className="text-2xl font-bold mb-4">No Products Available for Feedback</h1>
        <p className="mb-4">You can only provide feedback for delivered orders.</p>
        <button
          onClick={() => router.push('/orders')}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          View Orders
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Leave Feedback</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Product
            </label>
            {eligibleProducts.length === 1 ? (
              <div className="flex items-center space-x-4 p-3 border rounded">
                <img
                  src={eligibleProducts[0].image}
                  alt={eligibleProducts[0].name}
                  className="w-16 h-16 object-cover rounded"
                />
                <span className="font-medium">{eligibleProducts[0].name}</span>
              </div>
            ) : (
              <div className="space-y-2">
                {eligibleProducts.map((product) => (
                  <label key={product._id} className="flex items-center space-x-4 p-3 border rounded cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="product"
                      value={product._id}
                      checked={selectedProduct === product._id}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      className="w-4 h-4"
                    />
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <span className="font-medium">{product.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-2xl ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  ⭐
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-1">Current rating: {rating} star{rating !== 1 ? 's' : ''}</p>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Tell us about your experience..."
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/orders')}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
