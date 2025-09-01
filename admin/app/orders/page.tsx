'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../components/ProtectedRoute';
import AdminLayout from '../../components/AdminLayout';
import { useAdmin } from '../../context/AdminContext';

interface Order {
  _id: string;
  user: {
    username: string;
    email: string;
  };
  items: Array<{
    product: {
      _id: string;
      name: string;
      price: number;
      image?: string;
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
}

const statusColors = {
  placed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-yellow-100 text-yellow-800',
  prepared: 'bg-purple-100 text-purple-800',
  out_for_delivery: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800'
};

const paymentStatusColors = {
  pending: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800'
};

export default function OrdersPage() {
  const { admin } = useAdmin();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');

  const fetchOrders = async () => {
    if (!admin?.token) {
      setError('No admin token available');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/orders`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${admin.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Order fetch error:', err);
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [admin]);

  const handleStatusUpdate = async (orderId: string, newStatus: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    if (!admin?.token) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${admin.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update order: ${errorText}`);
      }

      await fetchOrders();
    } catch (err: any) {
      console.error('Status update error:', err);
      alert(`Failed to update order status: ${err.message}`);
    }
  };

  const handlePaymentStatusUpdate = async (orderId: string, newPaymentStatus: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    if (!admin?.token) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${admin.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update payment status: ${errorText}`);
      }

      await fetchOrders();
    } catch (err: any) {
      console.error('Payment status update error:', err);
      alert(`Failed to update payment status: ${err.message}`);
    }
  };

  const handleRowClick = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  const filteredOrders = orders
    .filter(order => filter === 'all' || order.status === filter)
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'amount':
          return b.totalAmount - a.totalAmount;
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAddress = (address: Order['deliveryAddress']) => {
    return `${address.street}, ${address.city}, ${address.state} - ${address.zip}`;
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="p-6 bg-gray-50 min-h-screen">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h1>
              <p className="text-gray-600">Manage and track all customer orders</p>
            </div>
            <button 
              onClick={fetchOrders}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-semibold transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Pending Orders</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {orders.filter(o => ['placed', 'preparing'].includes(o.status)).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Out for Delivery</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {orders.filter(o => o.status === 'out_for_delivery').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Delivered</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {orders.filter(o => o.status === 'delivered').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Filter by Status</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-gray-900"
                >
                  <option value="all">All Orders</option>
                  <option value="placed">Placed</option>
                  <option value="preparing">Preparing</option>
                  <option value="prepared">Prepared</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'status')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-gray-900"
                >
                  <option value="date">Date (Newest First)</option>
                  <option value="amount">Amount (Highest First)</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading orders...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6 flex items-center gap-3 text-red-700">
              <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="font-medium">{error}</p>
                <button 
                  onClick={fetchOrders}
                  className="mt-2 text-sm font-semibold text-red-800 hover:text-red-900 underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredOrders.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500">Orders will appear here once customers start placing them</p>
            </div>
          )}

          {/* Orders Table */}
          {!loading && !error && filteredOrders.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    All Orders ({filteredOrders.length})
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    Table View
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <tr 
                        key={order._id} 
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleRowClick(order._id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="font-semibold text-gray-900">
                              #{order._id.slice(-8).toUpperCase()}
                            </div>
                            <div className="text-gray-500">
                              {formatDate(order.createdAt)}
                            </div>
                            <div className="text-gray-900 font-medium text-sm mt-1">
                              ₹{order.totalAmount.toLocaleString()}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="font-semibold text-gray-900">
                              {order.user.username}
                            </div>
                            <div className="text-gray-500 text-sm">
                              {order.user.email}
                            </div>
                            <div className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {order.deliveryAddress.city}, {order.deliveryAddress.state}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-sm">
                            {order.items.slice(0, 2).map((item, index) => (
                              <div key={index} className="text-gray-900 font-medium">
                                {item.quantity}x {item.product.name}
                              </div>
                            ))}
                            {order.items.length > 2 && (
                              <div className="text-gray-500 text-xs">
                                +{order.items.length - 2} more items
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                              order.paymentMethod === 'online' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {order.paymentMethod === 'online' ? 'Online' : 'COD'}
                            </span>
                            <div className="mt-1">
                              {order.paymentMethod === 'cod' ? (
                                <select
                                  value={order.paymentStatus}
                                  onChange={(e) => handlePaymentStatusUpdate(order._id, e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  className={`text-xs font-medium px-2 py-1 rounded-full border border-gray-300 cursor-pointer ${
                                    paymentStatusColors[order.paymentStatus]
                                  }`}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="completed">Completed</option>
                                  <option value="failed">Failed</option>
                                </select>
                              ) : (
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                  paymentStatusColors[order.paymentStatus]
                                }`}>
                                  {order.paymentStatus}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                            statusColors[order.status]
                          }`}>
                            {order.status.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-gray-900"
                          >
                            <option value="placed">Placed</option>
                            <option value="preparing">Preparing</option>
                            <option value="prepared">Prepared</option>
                            <option value="out_for_delivery">Out for Delivery</option>
                            <option value="delivered">Delivered</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Show total count */}
          {!loading && !error && filteredOrders.length > 0 && (
            <div className="text-center text-gray-500 text-sm mt-6">
              <p>Showing {filteredOrders.length} of {orders.length} orders</p>
              <p className="text-xs mt-1 text-gray-400">
                💡 Click on any order row to view detailed information
              </p>
            </div>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
