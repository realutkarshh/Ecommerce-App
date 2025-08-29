// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { UserProvider } from './context/user-context';
import { CartProvider } from './context/cart-context';
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
        <CartProvider>
          <UserProvider>
            <header className="bg-white shadow-sm">
              <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <h1 className="font-bold text-xl">🍔 Burger Pizza</h1>
                <nav className="flex items-center gap-4">
                  <PageNavLinks />
                </nav>
              </div>
            </header>
            <main>{children}</main>
          </UserProvider>
        </CartProvider>
      </body>
    </html>
  );
}
