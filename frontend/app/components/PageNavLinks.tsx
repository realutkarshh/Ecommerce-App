// app/components/PageNavLinks.tsx
'use client';

import { useCart } from '@/app/context/cart-context';
import { useWishlist } from '@/app/context/wishlist-context'; // Add this
import { useUser } from '@/app/context/user-context';
import Link from 'next/link';

export default function PageNavLinks() {
  const { cart } = useCart();
  const { wishlist } = useWishlist(); // Add this
  const { user, logout } = useUser();

  // Sum all item quantities in cart
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlist.length; // Add this

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="font-medium">Hello, {user.username}</span>
        <Link href="/products" className="hover:underline">
          Menu
        </Link>
        <Link href="/orders" className="hover:underline">
          Orders
        </Link>
        <Link href="/profile" className="hover:underline">
          Profile
        </Link>
        
        {/* Wishlist Icon */}
        <Link href="/wishlist" className="relative p-2 hover:bg-red-50 rounded-full">
          {wishlistCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
              {wishlistCount}
            </span>
          )}
          <span>❤️</span>
        </Link>
        
        {/* Cart Icon */}
        <Link href="/cart" className="relative p-2 hover:bg-blue-50 rounded-full">
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
              {cartCount}
            </span>
          )}
          <span>🛒</span>
        </Link>
        
        <button
          onClick={logout}
          className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm"
        >
          Logout
        </button>
      </div>
    );
  }

  // Not logged in - same pattern with wishlist
  return (
    <div className="flex items-center gap-4">
      <Link href="/products" className="hover:underline">
        Menu
      </Link>
      <Link href="/login" className="px-3 py-2 text-blue-500 hover:underline text-sm">
        Login
      </Link>
      <Link href="/register" className="px-3 py-2 text-blue-500 hover:underline text-sm">
        Register
      </Link>
      
      {/* Wishlist for non-logged users */}
      <Link href="/wishlist" className="relative p-2 hover:bg-red-50 rounded-full">
        {wishlistCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {wishlistCount}
          </span>
        )}
        <span>❤️</span>
      </Link>
      
      <Link href="/cart" className="relative p-2 hover:bg-blue-50 rounded-full">
        {cartCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {cartCount}
          </span>
        )}
        <span>🛒</span>
      </Link>
    </div>
  );
}
