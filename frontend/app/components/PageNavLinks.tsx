// app/components/PageNavLinks.tsx
'use client';

import { useCart } from '@/app/context/cart-context';
import { useWishlist } from '@/app/context/wishlist-context';
import { useUser } from '@/app/context/user-context';
import Link from 'next/link';
import { useState } from 'react';

export default function PageNavLinks() {
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const { user, logout } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sum all item quantities in cart
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlist.length;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Add safety check for username
  const getUserInitial = () => {
    if (!user?.username || typeof user.username !== 'string') return 'U';
    return user.username.charAt(0).toUpperCase();
  };

  const getUsername = () => {
    return user?.username || 'User';
  };

  if (user) {
    return (
      <div className="relative">
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6">
          {/* Welcome Message */}
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-red-50 rounded-full border border-orange-100">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {getUserInitial()}
            </div>
            <span className="font-medium text-gray-700 text-sm">Hello, {getUsername()}</span>
          </div>

          {/* Navigation Links */}
          <Link href="/products" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-orange-600 font-medium transition-all duration-200 hover:bg-orange-50 rounded-lg group">
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Menu
          </Link>

          <Link href="/orders" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-orange-600 font-medium transition-all duration-200 hover:bg-orange-50 rounded-lg group">
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Orders
          </Link>

          <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-orange-600 font-medium transition-all duration-200 hover:bg-orange-50 rounded-lg group">
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
          </Link>

          {/* Action Icons */}
          <div className="flex items-center gap-2 ml-4">
            {/* Wishlist */}
            <Link href="/wishlist" className="relative group">
              <div className="flex items-center justify-center w-11 h-11 bg-white hover:bg-red-50 rounded-xl shadow-sm border border-gray-100 hover:border-red-200 transition-all duration-200 hover:scale-105">
                <svg className="w-5 h-5 text-gray-600 group-hover:text-red-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-lg animate-pulse">
                    {wishlistCount}
                  </span>
                )}
              </div>
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative group">
              <div className="flex items-center justify-center w-11 h-11 bg-white hover:bg-orange-50 rounded-xl shadow-sm border border-gray-100 hover:border-orange-200 transition-all duration-200 hover:scale-105">
                <svg className="w-5 h-5 text-gray-600 group-hover:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-lg animate-pulse">
                    {cartCount}
                  </span>
                )}
              </div>
            </Link>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 ml-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-medium rounded-xl transition-all duration-200 hover:scale-105 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex lg:hidden items-center gap-4">
          {/* Mobile Icons */}
          <Link href="/wishlist" className="relative">
            <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg shadow-sm border border-gray-100">
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                  {wishlistCount}
                </span>
              )}
            </div>
          </Link>

          <Link href="/cart" className="relative">
            <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg shadow-sm border border-gray-100">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-orange-500 rounded-full">
                  {cartCount}
                </span>
              )}
            </div>
          </Link>

          <button
            onClick={toggleMobileMenu}
            className="flex items-center justify-center w-10 h-10 bg-white rounded-lg shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
            aria-label="Toggle mobile menu"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 lg:hidden bg-white border-t border-gray-100 shadow-lg z-50 mt-2 rounded-lg">
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-100">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {getUserInitial()}
                </div>
                <span className="font-medium text-gray-700">Hello, {getUsername()}</span>
              </div>
              
              <Link href="/products" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-orange-50 rounded-lg transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Menu
              </Link>
              
              <Link href="/orders" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-orange-50 rounded-lg transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Orders
              </Link>
              
              <Link href="/profile" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-orange-50 rounded-lg transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </Link>
              
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full p-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Not logged in state
  return (
    <div className="relative">
      {/* Desktop Navigation - Not Logged In */}
      <div className="hidden lg:flex items-center gap-6">
        <Link href="/products" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-orange-600 font-medium transition-all duration-200 hover:bg-orange-50 rounded-lg group">
          <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Menu
        </Link>

        {/* Action Icons */}
        <div className="flex items-center gap-2">
          <Link href="/wishlist" className="relative group">
            <div className="flex items-center justify-center w-11 h-11 bg-white hover:bg-red-50 rounded-xl shadow-sm border border-gray-100 hover:border-red-200 transition-all duration-200 hover:scale-105">
              <svg className="w-5 h-5 text-gray-600 group-hover:text-red-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-lg animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </div>
          </Link>

          <Link href="/cart" className="relative group">
            <div className="flex items-center justify-center w-11 h-11 bg-white hover:bg-orange-50 rounded-xl shadow-sm border border-gray-100 hover:border-orange-200 transition-all duration-200 hover:scale-105">
              <svg className="w-5 h-5 text-gray-600 group-hover:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-lg animate-pulse">
                  {cartCount}
                </span>
              )}
            </div>
          </Link>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3 ml-4">
          <Link href="/login" className="px-4 py-2 text-gray-700 hover:text-orange-600 font-medium transition-all duration-200 hover:bg-orange-50 rounded-lg">
            Login
          </Link>
          <Link href="/register" className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium rounded-xl transition-all duration-200 hover:scale-105 shadow-sm">
            Sign Up
          </Link>
        </div>
      </div>

      {/* Mobile Menu Button - Not Logged In */}
      <div className="flex lg:hidden items-center gap-4">
        <Link href="/wishlist" className="relative">
          <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg shadow-sm border border-gray-100">
            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                {wishlistCount}
              </span>
            )}
          </div>
        </Link>

        <Link href="/cart" className="relative">
          <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg shadow-sm border border-gray-100">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-orange-500 rounded-full">
                {cartCount}
              </span>
            )}
          </div>
        </Link>

        <button
          onClick={toggleMobileMenu}
          className="flex items-center justify-center w-10 h-10 bg-white rounded-lg shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
          aria-label="Toggle mobile menu"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Mobile Menu Dropdown - Not Logged In */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 lg:hidden bg-white border-t border-gray-100 shadow-lg z-50 mt-2 rounded-lg">
          <div className="p-4 space-y-3">
            <Link href="/products" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-orange-50 rounded-lg transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Menu
            </Link>
            
            <Link href="/login" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-orange-50 rounded-lg transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Login
            </Link>
            
            <Link href="/register" className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
