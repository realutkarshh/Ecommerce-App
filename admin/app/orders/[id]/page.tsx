'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '../../../components/ProtectedRoute';
import AdminLayout from '../../../components/AdminLayout';
import { useAdmin } from '../../../context/AdminContext';
import Image from 'next/image';

interface Order {
  _id: string;
  user: {
    _id: string;
    username: string;
    email: string;
  };
  items: Array<{
    product: {
      _id: string;
      name: string;
      price: number;
      image: string;
      category?: string;
    };
    quantity: number;
  }>;
  totalAmount: number;
  status: 'placed' | 'preparing' | 'prepared' | 'out_for_delivery' | 'delivered';
  paymentMethod: 'online' | 'cod';
  paymentStatus: 'pending' | 'completed' | 'failed';
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
  updatedAt?: string;
}

const statusColors = {
  placed: 'bg-blue-100 text-blue-800 border-blue-200',
  preparing: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  prepared: 'bg-purple-100 text-purple-800 border-purple-200',
  out_for_delivery: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  delivered: 'bg-green-100 text-green-800 border-green-200'
};

const statusIcons = {
  placed: '📋',
  preparing: '👨‍🍳',
  prepared: '✅',
  out_for_delivery: '🚚',
  delivered: '📦'
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { admin } = useAdmin();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrder = async () => {
    if (!admin?.token || !id) {
      setError('Missing authentication or order ID');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/orders`, {
        headers: {
          'Authorization': `Bearer ${admin.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }

      const orders = await response.json();
      const foundOrder = orders.find((o: Order) => o._id === id);
      
      if (!foundOrder) {
        throw new Error('Order not found');
      }

      setOrder(foundOrder);
    } catch (err: any) {
      console.error('Order fetch error:', err);
      setError(err.message || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [admin, id]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!admin?.token || !order) return;

    try {
      setUpdatingStatus(true);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/orders/${order._id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${admin.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update status: ${errorText}`);
      }

      const updatedOrder = await response.json();
      setOrder(updatedOrder);
    } catch (err: any) {
      console.error('Status update error:', err);
      alert(`Failed to update order status: ${err.message}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const calculateItemTotal = (price: number, quantity: number) => {
    return price * quantity;
  };

  const getStatusProgress = (status: string) => {
    const statuses = ['placed', 'preparing', 'prepared', 'out_for_delivery', 'delivered'];
    const currentIndex = statuses.indexOf(status);
    return ((currentIndex + 1) / statuses.length) * 100;
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading order details...</p>
            </div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  if (error) {
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Order</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="space-x-4">
                <button
                  onClick={fetchOrder}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => router.back()}
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

  if (!order) return null;

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Order #{order._id.slice(-8).toUpperCase()}
                </h1>
                <p className="text-gray-600">Placed on {formatDate(order.createdAt)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-lg font-medium border ${statusColors[order.status]}`}>
                {statusIcons[order.status]} {order.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column - Main Details */}
            <div className="xl:col-span-2 space-y-8">
              {/* Order Progress */}
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Progress</h2>
                
                {/* Progress Bar */}
                <div className="relative mb-8">
                  <div className="flex items-center justify-between">
                    {['placed', 'preparing', 'prepared', 'out_for_delivery', 'delivered'].map((status, index) => {
                      const isCompleted = ['placed', 'preparing', 'prepared', 'out_for_delivery', 'delivered'].indexOf(order.status) >= index;
                      const isCurrent = order.status === status;
                      
                      return (
                        <div key={status} className="flex flex-col items-center relative z-10">
                          <div className={`w-10 h-10 rounded-full border-4 flex items-center justify-center ${
                            isCompleted 
                              ? 'bg-blue-500 border-blue-500 text-white' 
                              : 'bg-white border-gray-300 text-gray-400'
                          }`}>
                            {isCompleted ? (
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <div className="w-2 h-2 bg-current rounded-full"></div>
                            )}
                          </div>
                          <div className="mt-2 text-center">
                            <div className={`text-sm font-medium ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                              {statusIcons[status as keyof typeof statusIcons]}
                            </div>
                            <div className={`text-xs mt-1 ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-gray-700' : 'text-gray-500'}`}>
                              {status.replace('_', ' ')}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Progress Line */}
                  <div className="absolute top-5 left-5 right-5 h-1 bg-gray-200 -z-0">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-300" 
                      style={{ width: `${getStatusProgress(order.status)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Status Update */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Update Order Status
                  </label>
                  <div className="flex gap-3 text-black">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(e.target.value)}
                      disabled={updatingStatus}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="placed">Placed</option>
                      <option value="preparing">Preparing</option>
                      <option value="prepared">Prepared</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                    </select>
                    {updatingStatus && (
                      <div className="flex items-center px-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Items</h2>
                
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-grow">
                        <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                        <p className="text-sm text-gray-600">
                          {item.product.category && `Category: ${item.product.category}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          ₹{item.product.price} × {item.quantity}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          ₹{calculateItemTotal(item.product.price, item.quantity)}
                        </p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>₹{order.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax (5%)</span>
                      <span>₹{Math.round(order.totalAmount * 0.05)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery Fee</span>
                      <span>₹{order.totalAmount > 499 ? 0 : 50}</span>
                    </div>
                    <hr className="my-3" />
                    <div className="flex justify-between text-xl font-bold text-gray-900">
                      <span>Total Amount</span>
                      <span>₹{order.totalAmount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Customer & Payment Details */}
            <div className="space-y-8">
              {/* Customer Information */}
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Details</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{order.user.username}</p>
                      <p className="text-sm text-gray-600">{order.user.email}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      Delivery Address
                    </h3>
                    <div className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg">
                      <p>{order.deliveryAddress.street}</p>
                      <p>{order.deliveryAddress.city}, {order.deliveryAddress.state}</p>
                      <p>PIN: {order.deliveryAddress.zip}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Details</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Payment Method</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.paymentMethod === 'online' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {order.paymentMethod === 'online' ? '💳 Online Payment' : '💵 Cash on Delivery'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Payment Status</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.paymentStatus === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : order.paymentStatus === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </span>
                  </div>
                  
                  {order.razorpayOrderId && (
                    <div className="pt-3 border-t border-gray-100 space-y-2">
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">Razorpay Order ID:</span>
                        <p className="font-mono bg-gray-50 p-1 rounded mt-1 break-all">
                          {order.razorpayOrderId}
                        </p>
                      </div>
                      
                      {order.razorpayPaymentId && (
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">Payment ID:</span>
                          <p className="font-mono bg-gray-50 p-1 rounded mt-1 break-all">
                            {order.razorpayPaymentId}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Order Metadata */}
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Information</h2>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID</span>
                    <span className="font-mono">{order._id}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created</span>
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                  
                  {order.updatedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Updated</span>
                      <span>{formatDate(order.updatedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
