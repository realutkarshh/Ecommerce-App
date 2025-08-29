// app/page.tsx
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-192px)] bg-gray-50 px-4 py-12 flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold mb-4 text-gray-900">Welcome to Burger Pizza</h1>
      <p className="mb-8 text-lg text-gray-600 max-w-2xl">
        Order your favorite burgers, pizzas, and more. Fast delivery, great taste!
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/products"
          className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-8 rounded-lg"
        >
          Browse Menu
        </Link>
        <Link
          href="/cart"
          className="inline-block bg-white hover:bg-gray-100 text-gray-800 font-medium py-3 px-8 rounded-lg border border-gray-300"
        >
          View Cart
        </Link>
      </div>
    </div>
  );
}
