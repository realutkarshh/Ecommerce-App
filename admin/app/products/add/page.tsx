// app/products/add/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '../../../components/ProtectedRoute';
import AdminLayout from '../../../components/AdminLayout';
import { useAdmin } from '../../../context/AdminContext';
import { addProduct } from '../../../lib/api';

export default function AddProductPage() {
  const { admin } = useAdmin();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Burger',
    bestSeller: false,
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [error, setError] = useState('');

  const categories = ['Burger', 'Pizza', 'Fries', 'Drink', 'Dessert'];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size must be less than 5MB');
        return;
      }
      setImage(file);
      setError('');
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admin?.token || !image) {
      setError('Please select an image and ensure you are logged in');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        form.append(key, value.toString());
      });
      form.append('image', image);

      await addProduct(form, admin.token);
      router.push('/products');
    } catch (err) {
      setError('Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="p-6 bg-gray-50 min-h-screen">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Product</h1>
              <p className="text-gray-600">Create a new menu item for your restaurant</p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Products
            </Link>
          </div>

          {/* Form Container */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
                    placeholder="e.g. Deluxe Cheese Burger"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 resize-none text-gray-900 bg-white"
                    placeholder="Describe your product in detail..."
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Provide a detailed description that will help customers understand your product
                  </p>
                </div>

                {/* Category and Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Category *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 appearance-none bg-white text-gray-900"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat} className="text-gray-900">
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
                      placeholder="199"
                    />
                  </div>
                </div>

                {/* Product Image */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Product Image *
                  </label>
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        required
                        onChange={handleImageChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 text-gray-900 bg-white"
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      Upload a high-quality image (JPG, PNG, WebP). Maximum size: 5MB
                    </p>
                    
                    {imagePreview && (
                      <div className="mt-4">
                        <p className="text-sm font-semibold text-gray-900 mb-3">Image Preview:</p>
                        <div className="relative inline-block">
                          <img
                            src={imagePreview}
                            alt="Product preview"
                            className="h-48 w-48 object-cover rounded-lg border border-gray-200 shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImage(null);
                              setImagePreview('');
                              (document.querySelector('input[type="file"]') as HTMLInputElement).value = '';
                            }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Best Seller Option */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="bestSeller"
                    checked={formData.bestSeller}
                    onChange={(e) => setFormData({ ...formData, bestSeller: e.target.checked })}
                    className="mt-1 h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                  />
                  <div>
                    <label htmlFor="bestSeller" className="text-sm font-semibold text-gray-900 cursor-pointer">
                      Mark as Best Seller
                    </label>
                    <p className="text-sm text-gray-500">
                      This product will be highlighted as a customer favorite
                    </p>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 sm:flex-none sm:px-8 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Adding Product...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Product
                      </>
                    )}
                  </button>
                  <Link
                    href="/products"
                    className="flex-1 sm:flex-none sm:px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200 text-center"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
