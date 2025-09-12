// app/products/[id]/page.tsx
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../../components/ProtectedRoute';
import AdminLayout from '../../../components/AdminLayout';
import { useAdmin } from '../../../context/AdminContext';
import { getProduct, updateProduct } from '../../../lib/api';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  bestSeller?: boolean;
}

interface FormData {
  name: string;
  description: string;
  price: string;
  category: string;
  bestSeller: boolean;
}

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const { admin } = useAdmin();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [productId, setProductId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    category: 'Burger',
    bestSeller: false,
  });
  const [currentImage, setCurrentImage] = useState('');
  const [newImage, setNewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<FormData>>({});
  const [originalData, setOriginalData] = useState<FormData | null>(null);
  const [imageError, setImageError] = useState(false);

  const categories = ['Burger', 'Pizza', 'Fries', 'Drink', 'Dessert'];

  // Extract ID from params Promise
  useEffect(() => {
    const getParamsId = async () => {
      try {
        const resolvedParams = await params;
        setProductId(resolvedParams.id);
      } catch (error) {
        console.error('Error resolving params:', error);
        setError('Invalid product ID');
        setFetchLoading(false);
      }
    };

    getParamsId();
  }, [params]);

  const fetchProduct = useCallback(async () => {
    if (!productId) {
      return;
    }

    try {
      setFetchLoading(true);
      setError('');
      
      const product = await getProduct(productId);
      
      if (!product) {
        throw new Error('Product not found');
      }

      const productData = {
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '0',
        category: product.category || 'Burger',
        bestSeller: product.bestSeller || false,
      };

      setFormData(productData);
      setOriginalData(productData);
      setCurrentImage(product.image || '');
    } catch (err) {
      console.error('Product fetch error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load product';
      setError(errorMessage);
    } finally {
      setFetchLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (productId && admin?.token) {
      fetchProduct();
    }
  }, [fetchProduct, productId, admin?.token]);

  const validateForm = (): boolean => {
    const errors: Partial<FormData> = {};
    let isValid = true;

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Product name is required';
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Product name must be at least 2 characters';
      isValid = false;
    } else if (formData.name.length > 100) {
      errors.name = 'Product name must not exceed 100 characters';
      isValid = false;
    }

    // Description validation
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
      isValid = false;
    } else if (formData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
      isValid = false;
    } else if (formData.description.length > 500) {
      errors.description = 'Description must not exceed 500 characters';
      isValid = false;
    }

    // Price validation
    if (!formData.price.trim()) {
      errors.price = 'Price is required';
      isValid = false;
    } else {
      const priceNum = parseFloat(formData.price);
      if (isNaN(priceNum) || priceNum <= 0) {
        errors.price = 'Price must be a valid positive number';
        isValid = false;
      } else if (priceNum > 10000) {
        errors.price = 'Price must not exceed ₹10,000';
        isValid = false;
      }
    }

    // Category validation
    if (!categories.includes(formData.category)) {
      errors.category = 'Please select a valid category';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError('');
    
    if (!file) {
      setNewImage(null);
      setImagePreview('');
      return;
    }

    // File type validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPG, PNG, WebP)');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // File size validation (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setNewImage(file);
    
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.onerror = () => {
      setError('Failed to read image file');
      setNewImage(null);
      setImagePreview('');
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Clear general error
    if (error) setError('');
  };

  const clearNewImage = () => {
    setNewImage(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const hasUnsavedChanges = (): boolean => {
    if (!originalData) return false;
    
    return (
      formData.name !== originalData.name ||
      formData.description !== originalData.description ||
      formData.price !== originalData.price ||
      formData.category !== originalData.category ||
      formData.bestSeller !== originalData.bestSeller ||
      newImage !== null
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!productId) {
      setError('Product ID is missing');
      return;
    }
    
    // Clear previous errors
    setError('');
    setFieldErrors({});

    // Validate form
    if (!validateForm()) {
      setError('Please correct the errors below');
      return;
    }

    // Check authentication
    if (!admin?.token) {
      setError('Authentication required. Please log in again.');
      return;
    }

    setLoading(true);

    try {
      const form = new FormData();
      
      // Append form data with validation
      form.append('name', formData.name.trim());
      form.append('description', formData.description.trim());
      form.append('price', formData.price.trim());
      form.append('category', formData.category);
      form.append('bestSeller', formData.bestSeller.toString());
      
      if (newImage) {
        form.append('image', newImage);
      }

      await updateProduct(productId, form, admin.token);
      
      // Show success message
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      successDiv.textContent = 'Product updated successfully!';
      document.body.appendChild(successDiv);
      
      setTimeout(() => {
        if (document.body.contains(successDiv)) {
          document.body.removeChild(successDiv);
        }
      }, 3000);

      // Navigate to products page
      router.push('/products');
      
    } catch (err) {
      console.error('Product update error:', err);
      
      let errorMessage = 'Failed to update product. Please try again.';
      
      if (err instanceof Error) {
        if (err.message.includes('network') || err.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (err.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again.';
        } else if (err.message.includes('size') || err.message.includes('large')) {
          errorMessage = 'Image file is too large. Please choose a smaller image.';
        } else if (err.message.includes('format') || err.message.includes('type')) {
          errorMessage = 'Invalid image format. Please upload a JPG, PNG, or WebP image.';
        } else if (err.message.includes('duplicate') || err.message.includes('exists')) {
          errorMessage = 'A product with this name already exists.';
        } else if (err.message.includes('not found')) {
          errorMessage = 'Product not found. It may have been deleted.';
        } else {
          errorMessage = err.message || errorMessage;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    if (hasUnsavedChanges()) {
      const confirmLeave = window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      );
      if (!confirmLeave) return;
    }

    router.push('/products');
  };

  const handleImageError = () => {
    setImageError(true);
  };

  if (fetchLoading) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading product...</p>
            </div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  if (error && !formData.name && !productId) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center max-w-md">
              <div className="bg-red-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Product</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="space-x-4">
                <button
                  onClick={fetchProduct}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => router.push('/products')}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="p-6 bg-gray-50 min-h-screen">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Product</h1>
              <p className="text-gray-600">Update your menu item details</p>
            </div>
            <button
              onClick={handleGoBack}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Products
            </button>
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

              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* Product Name */}
                <div>
                  <label htmlFor="productName" className="block text-sm font-semibold text-gray-900 mb-2">
                    Product Name *
                  </label>
                  <input
                    id="productName"
                    type="text"
                    required
                    maxLength={100}
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={loading}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 text-gray-900 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      fieldErrors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g. Deluxe Cheese Burger"
                    aria-describedby={fieldErrors.name ? "name-error" : undefined}
                  />
                  {fieldErrors.name && (
                    <p id="name-error" className="mt-1 text-sm text-red-600">
                      {fieldErrors.name}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    {formData.name.length}/100 characters
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="productDescription" className="block text-sm font-semibold text-gray-900 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="productDescription"
                    required
                    rows={4}
                    maxLength={500}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    disabled={loading}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 resize-none text-gray-900 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      fieldErrors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Describe your product in detail..."
                    aria-describedby={fieldErrors.description ? "description-error" : undefined}
                  />
                  {fieldErrors.description && (
                    <p id="description-error" className="mt-1 text-sm text-red-600">
                      {fieldErrors.description}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    {formData.description.length}/500 characters
                  </p>
                </div>

                {/* Category and Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="productCategory" className="block text-sm font-semibold text-gray-900 mb-2">
                      Category *
                    </label>
                    <select
                      id="productCategory"
                      required
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      disabled={loading}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 appearance-none bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                        fieldErrors.category ? 'border-red-300' : 'border-gray-300'
                      }`}
                      aria-describedby={fieldErrors.category ? "category-error" : undefined}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat} className="text-gray-900">
                          {cat}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.category && (
                      <p id="category-error" className="mt-1 text-sm text-red-600">
                        {fieldErrors.category}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="productPrice" className="block text-sm font-semibold text-gray-900 mb-2">
                      Price (₹) *
                    </label>
                    <input
                      id="productPrice"
                      type="number"
                      required
                      min="0"
                      max="10000"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      disabled={loading}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 text-gray-900 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed ${
                        fieldErrors.price ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="199"
                      aria-describedby={fieldErrors.price ? "price-error" : undefined}
                    />
                    {fieldErrors.price && (
                      <p id="price-error" className="mt-1 text-sm text-red-600">
                        {fieldErrors.price}
                      </p>
                    )}
                  </div>
                </div>

                {/* Product Image */}
                <div>
                  <label htmlFor="productImage" className="block text-sm font-semibold text-gray-900 mb-2">
                    Product Image
                  </label>
                  
                  {/* Current Image */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">Current image:</p>
                    <div className="relative inline-block">
                      {currentImage && !imageError ? (
                        <img
                          src={currentImage}
                          alt="Current product"
                          className="h-48 w-48 object-cover rounded-lg border border-gray-200 shadow-sm"
                          onError={handleImageError}
                        />
                      ) : (
                        <div className="h-48 w-48 bg-gray-200 rounded-lg flex items-center justify-center border border-gray-200">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upload New Image */}
                  <div className="space-y-4">
                    <input
                      id="productImage"
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageChange}
                      disabled={loading}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 text-gray-900 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <p className="text-sm text-gray-500">
                      Upload a new image to replace current one (Optional). Max size: 5MB
                    </p>
                    
                    {imagePreview && (
                      <div className="mt-4">
                        <p className="text-sm font-semibold text-gray-900 mb-3">New image preview:</p>
                        <div className="relative inline-block">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="h-48 w-48 object-cover rounded-lg border border-gray-200 shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={clearNewImage}
                            disabled={loading}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Remove new image"
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
                    onChange={(e) => handleInputChange('bestSeller', e.target.checked)}
                    disabled={loading}
                    className="mt-1 h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
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
                        Updating Product...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Update Product
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleGoBack}
                    disabled={loading}
                    className="flex-1 sm:flex-none sm:px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-center"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
