// app/checkout/page.tsx
'use client';

import { useCart } from '@/app/context/cart-context';
import { useUser } from '@/app/context/user-context';
import { getProductById } from '@/lib/api';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  bestSeller?: boolean;
}

interface CartItemWithProduct extends Product {
  quantity: number;
}

export default function CheckoutPage() {
  const { cart } = useCart();
  const { user } = useUser();
  const [orderItems, setOrderItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch product details for each cart item
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const items = await Promise.all(
          cart.map(async (item) => {
            const product = await getProductById(item.productId);
            return { ...product, quantity: item.quantity };
          })
        );
        setOrderItems(items.filter(Boolean));
      } catch (err) {
        console.error('Failed to load products:', err);
        setError('Failed to load order details. Please refresh.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [cart]);

  // Calculate total
  const total = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>
        <p className="text-lg mb-4">Please log in to proceed with checkout.</p>
        <Link
          href="/login"
          className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-md"
        >
          Login
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Loading your order...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center text-red-500">
        <h1 className="text-2xl font-bold mb-4">Checkout Error</h1>
        <p>{error}</p>
        <Link
          href="/cart"
          className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-md"
        >
          Return to Cart
        </Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <p className="mb-4">There are no items to checkout.</p>
        <Link
          href="/products"
          className="inline-block bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-md"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Invoice Summary</h1>
      <div className="mb-8 bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-baseline mb-4">
          <h2 className="font-bold text-lg">Order Details</h2>
          <span className="text-sm text-gray-600">
            For: {user.username} 
          </span>
        </div>
        <div className="space-y-4">
          {orderItems.map((item) => (
            <div
              key={item._id}
              className="flex justify-between items-center border-b pb-2"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={48}
                    height={48}
                    className="rounded-lg"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.name}</p>
                  <p className="text-sm text-gray-500">x {item.quantity}</p>
                </div>
              </div>
              <p className="font-bold">₹{item.price * item.quantity}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-4 mt-4 border-t">
          <span className="font-medium text-gray-600">Subtotal</span>
          <span className="font-bold">₹{total}</span>
        </div>
        <div className="flex justify-between items-center pt-2">
          <span className="font-medium text-gray-600">Tax</span>
          <span className="font-bold">₹0</span>
        </div>
        <div className="flex justify-between items-center pt-2 pb-4">
          <span className="font-medium text-gray-600">Shipping</span>
          <span className="font-bold">₹0</span>
        </div>
        <div className="flex justify-between items-center pt-4 border-t text-xl font-bold">
          <span>Total</span>
          <span>₹{total}</span>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <Link
          href="/cart"
          className="px-4 py-2 text-blue-500 hover:underline"
        >
          ← Back to Cart
        </Link>
        <button className="bg-green-500 hover:bg-green-600 text-white py-2 px-8 text-lg rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
          Pay Now
        </button>
      </div>
    </div>
  );
}
