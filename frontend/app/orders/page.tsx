'use client';

import { useEffect, useState } from 'react';
import { getUserOrders } from '@/lib/api';
import { useUser } from '@/app/context/user-context';
import Link from 'next/link';

interface OrderItem {
  product: {
    _id: string;
    name: string;
    price: number;
  };
  quantity: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function OrdersPage() {
  const { user } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchOrders() {
      if (!user?.token) return;
      try {
        const data = await getUserOrders(user.token);
        setOrders(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch orders.');
        setLoading(false);
      }
    }
    fetchOrders();
  }, [user]);

  if (loading) return <div className="p-8 text-center">Loading orders...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (orders.length === 0)
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-6">Your Orders</h1>
        <p>You have no orders.</p>
        <p className="mt-4">
          <Link href="/products" className="text-blue-500 hover:underline">
            Browse Menu
          </Link>
        </p>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Orders</h1>
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="border p-4 rounded">
            <div className="flex justify-between mb-2">
              <span className="font-semibold">Order ID: {order._id}</span>
              <span className="font-semibold">Status: {order.status}</span>
            </div>
            <div className="mb-2">
              {order.items.map((item) => (
                <div key={item.product._id} className="flex justify-between mb-2">
                  <span>
                    {item.quantity}x {item.product.name}
                  </span>
                  <span className="font-medium">₹{item.product.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="text-right font-bold mt-2">
              Total: <span className="text-xl">₹{order.totalAmount}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
