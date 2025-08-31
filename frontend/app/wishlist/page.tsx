// app/wishlist/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useWishlist } from '@/app/context/wishlist-context';
import { useCart } from '@/app/context/cart-context';
import { getProductById } from '@/lib/api';
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

interface WishlistItemWithProduct extends Product {
  addedAt: string;
}

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState<WishlistItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch product details for each wishlist item
  useEffect(() => {
    const fetchWishlistItems = async () => {
      if (wishlist.length === 0) {
        setWishlistItems([]);
        setLoading(false);
        return;
      }

      const items = await Promise.all(
        wishlist.map(async (item) => {
          try {
            const product = await getProductById(item.productId);
            return { ...product, addedAt: item.addedAt };
          } catch (error) {
            console.error('Failed to fetch product:', item.productId);
            return null;
          }
        })
      );
      setWishlistItems(items.filter(Boolean) as WishlistItemWithProduct[]);
      setLoading(false);
    };

    fetchWishlistItems();
  }, [wishlist]);

  const moveToCart = (productId: string) => {
    addToCart(productId);
    removeFromWishlist(productId);
  };

  if (loading) return <div className="p-8 text-center">Loading wishlist...</div>;

  if (wishlist.length === 0) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Your Wishlist</h1>
        <p className="mb-4">Your wishlist is empty.</p>
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Wishlist ({wishlist.length} items)</h1>
        <button
          onClick={clearWishlist}
          className="text-red-600 hover:text-red-700 text-sm"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-6">
        {wishlistItems.map((item) => (
          <div
            key={item._id}
            className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow border-b pb-6"
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
              <p className="text-xl font-bold text-green-600">₹{item.price}</p>
              <p className="text-xs text-gray-500 mt-1">
                Added on {new Date(item.addedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:w-32">
              <button
                onClick={() => moveToCart(item._id)}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md text-sm"
              >
                Move to Cart
              </button>
              <button
                onClick={() => removeFromWishlist(item._id)}
                className="text-red-500 hover:text-red-700 py-2 px-4 text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
