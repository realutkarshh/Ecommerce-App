// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { UserProvider } from './context/user-context';        // 1st
import { CartProvider } from './context/cart-context';        // 2nd  
import { WishlistProvider } from './context/wishlist-context'; // 3rd
import PageNavLinks from './components/PageNavLinks';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Burger Pizza Ecommerce',
  description: 'Order your favorite food online',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>        {/* 1st - UserProvider at the top */}
          <CartProvider>      {/* 2nd - Can now access UserContext */}
            <WishlistProvider> {/* 3rd - Can access both UserContext and CartContext */}
              <header className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                  <Link href="/">
                    <h1 className="font-bold text-xl cursor-pointer">🍔FoodZA</h1>
                  </Link>
                  <nav className="flex items-center gap-4">
                    <PageNavLinks />
                  </nav>
                </div>
              </header>
              <main>{children}</main>
            </WishlistProvider>
          </CartProvider>
        </UserProvider>
      </body>
    </html>
  );
}
