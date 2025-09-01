
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@/app/context/user-context';
import { getUserOrders } from '@/lib/api';
import { Order } from '@/types/order';


export default function OrdersPage() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Check for success message
  const success = searchParams.get('success');
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.token) {
        setLoading(false);
        return;
      }

      try {
        const userOrders = await getUserOrders(user.token);
        setOrders(userOrders); // ✅ This will now work without TypeScript errors
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const getStatusColor = (status: string) => {
    const colors = {
      placed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-yellow-100 text-yellow-800',
      prepared: 'bg-orange-100 text-orange-800',
      out_for_delivery: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts = {
      placed: 'Order Placed',
      preparing: 'Preparing',
      prepared: 'Prepared',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const getPaymentStatusColor = (status: string) => {
    return status === 'completed' 
      ? 'bg-green-100 text-green-800' 
      : status === 'pending'
      ? 'bg-yellow-100 text-yellow-800'
      : 'bg-red-100 text-red-800';
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow text-center">
        <h1 className="text-2xl font-bold mb-4">Please Login</h1>
        <p className="mb-4">You need to be logged in to view your orders.</p>
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
    return <div className="text-center py-8">Loading your orders...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Your Orders</h1>

      {/* Success Message */}
      {success && orderId && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-green-400">✅</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Order placed successfully!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Order ID: {orderId}</p>
                <p>You will receive updates about your order status.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-4">
            <span className="text-6xl">📦</span>
          </div>
          <h2 className="text-xl font-bold mb-2">No orders yet</h2>
          <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
          <button
            onClick={() => router.push('/products')}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold">Order #{order._id.slice(-6)}</h3>
                  <p className="text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                  <div className="mt-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs ${getPaymentStatusColor(order.paymentStatus)}`}>
                      Payment: {order.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-3 mb-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product.name}</h4>
                      <p className="text-gray-600">Quantity: {item.quantity}</p>
                      <p className="font-bold">₹{item.product.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-600">
                    Payment: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Delivery: {order.deliveryAddress.street}, {order.deliveryAddress.city}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">Total: ₹{order.totalAmount}</p>
                  {order.status === 'delivered' && (
                    <button
                      onClick={() => router.push(`/feedback?orderId=${order._id}`)}
                      className="mt-2 text-sm bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
                    >
                      Leave Feedback
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
