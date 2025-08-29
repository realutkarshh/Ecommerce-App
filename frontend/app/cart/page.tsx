'use client';

import { useCart } from '@/app/context/cart-context';
import { getProductById } from '@/lib/api';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useUser } from '@/app/context/user-context';
import { useRouter } from 'next/navigation';
import { placeOrder } from '@/lib/api';

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

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useUser();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch product details for each cart item
  useEffect(() => {
    const fetchCartItems = async () => {
      const items = await Promise.all(
        cart.map(async (item) => {
          const product = await getProductById(item.productId);
          return { ...product, quantity: item.quantity };
        })
      );
      setCartItems(items);
      setLoading(false);
    };
    fetchCartItems();
  }, [cart]);

  const handleCheckout = async () => {
    if (!user?.token) {
      alert('Please log in to checkout.');
      return;
    }

    // Prepare items for the order API
    const orderItems = cart.map((item) => ({
      product: item.productId,
      quantity: item.quantity,
    }));

    // Calculate total amount
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    try {
      await placeOrder(orderItems, totalAmount, user.token);
      clearCart(); // Clear cart on successful order
      router.push('/orders'); // Redirect to orders page
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Checkout failed. Please try again.');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading cart...</div>;
  if (cart.length === 0)
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
        <p>Your cart is empty.</p>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      <div className="space-y-6">
        {cartItems.map((item) => (
          <div
            key={item._id}
            className="flex flex-col sm:flex-row gap-4 border-b pb-6"
          >
            <div className="flex-shrink-0">
              <Image
                src={item.image}
                alt={item.name}
                width={120}
                height={120}
                className="rounded-lg object-cover"
              />
            </div>
            <div className="flex-grow">
              <h2 className="font-bold text-lg">{item.name}</h2>
              <p className="text-gray-600 mb-2">{item.description}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item._id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                  –
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                  className="px-3 py-1 bg-gray-200 rounded"
                >
                  +
                </button>
              </div>
              <div className="text-xl font-bold">₹{item.price * item.quantity}</div>
              <button
                onClick={() => removeFromCart(item._id)}
                className="text-red-500 hover:underline text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        <div className="flex justify-between items-center mt-8 pt-4 border-t">
          <div className="text-xl font-bold">
            Total: ₹
            {cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)}
          </div>
          <button
            onClick={handleCheckout}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-md"
            disabled={!user}
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
