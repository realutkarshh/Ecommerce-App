// app/page.tsx - Dashboard with real data
'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminLayout from '../components/AdminLayout';
import { useAdmin } from '../context/AdminContext';
import { getDashboardStats } from '../lib/api';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  recentOrders: Array<{
    _id: string;
    totalAmount: number;
    createdAt: string;
  }>;
}

export default function Dashboard() {
  const { admin } = useAdmin();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      if (!admin?.token) return;
      
      try {
        setLoading(true);
        const data = await getDashboardStats(admin.token);
        setStats(data);
      } catch (err) {
        setError('Failed to load dashboard stats');
        console.error('Dashboard stats error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [admin]);

  if (loading) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading dashboard data...</p>
            </div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="p-6 min-h-[calc(100vh-64px)] bg-gray-50">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
            <p className="text-gray-600">Monitor your restaurant's performance and analytics</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-lg text-red-700 flex items-center gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
              <button
                onClick={() => window.location.reload()}
                className="ml-auto px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded font-medium transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {stats && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Products Card */}
                <div className="group bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-900 transition-colors">
                      <svg className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                      <p className="text-sm text-gray-600">Total Products</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    Active in menu
                  </div>
                </div>

                {/* Orders Card */}
                <div className="group bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-900 transition-colors">
                      <svg className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                      <p className="text-sm text-gray-600">Total Orders</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                    Orders completed
                  </div>
                </div>

                {/* Users Card */}
                <div className="group bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-900 transition-colors">
                      <svg className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                      <p className="text-sm text-gray-600">Registered Users</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                    Active customers
                  </div>
                </div>

                {/* Revenue Card */}
                <div className="group bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-900 transition-colors">
                      <svg className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Total Revenue</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    All-time earnings
                  </div>
                </div>
              </div>

              {/* Recent Orders Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders List */}
                <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                    </div>
                    <button className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                      View All →
                    </button>
                  </div>

                  <div className="space-y-4">
                    {stats.recentOrders?.slice(0, 5).map((order) => (
                      <div key={order._id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-xs font-bold text-gray-700">#{order._id.slice(-4).toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Order #{order._id.slice(-6)}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">₹{order.totalAmount}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-xs text-gray-500">Completed</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {(!stats.recentOrders || stats.recentOrders.length === 0) && (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <p className="text-gray-500">No recent orders</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions Sidebar */}
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <button className="w-full flex items-center gap-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                        <span className="font-medium">Add New Product</span>
                      </button>
                      
                      <button className="w-full flex items-center gap-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <span className="font-medium">View All Orders</span>
                      </button>
                      
                      <button className="w-full flex items-center gap-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <span className="font-medium">Manage Users</span>
                      </button>
                    </div>
                  </div>

                  {/* System Status */}
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">System Status</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Server Status</span>
                          <span className="font-semibold text-green-600">Online</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Database</span>
                          <span className="font-semibold text-green-600">Healthy</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">API Response</span>
                          <span className="font-semibold text-green-600">Fast</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
