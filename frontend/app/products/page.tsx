'use client';

import { useSearchParams } from 'next/navigation';
import { getProducts, getBestSellers, getProductsByCategory } from '@/lib/api';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/app/context/cart-context';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  bestSeller?: boolean;
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const [products, setProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchData() {
      try {
        const [products, best] = await Promise.all([
          category ? getProductsByCategory(category) : getProducts(),
          getBestSellers(),
        ]);
        console.log('Fetched products:', products);
        setProducts(products || []);
        setBestSellers(best || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
        setBestSellers([]);
        setLoading(false);
      }
    }
    fetchData();
  }, [category]);

  const categories = ['Burger', 'Pizza', 'Fries', 'Drink', 'Dessert'];

  if (loading) return <div className="p-8 text-center">Loading products...</div>;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Our Menu</h1>
      <div className="flex gap-2 mb-8">
        <Link
          href="/products"
          className={`px-3 py-2 rounded ${
            !category
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat}
            href={`/products?category=${cat}`}
            className={`px-3 py-2 rounded ${
              category === cat
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4">Best Sellers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bestSellers.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-lg shadow p-6 transition hover:shadow-lg relative"
            >
              <Link href={`/products/${product._id}`} className="block">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover mb-4 rounded"
                />
                <h3 className="font-bold mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-2">{product.description}</p>
                <p className="font-bold mb-4">₹{product.price}</p>
                {product.bestSeller && (
                  <div className="text-xs font-semibold text-yellow-600">
                    ★ Best Seller
                  </div>
                )}
              </Link>
              <button
                onClick={() => addToCart(product._id)}
                className="absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-4">
          {category ? `${category}s` : 'All Items'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-lg shadow p-6 transition hover:shadow-lg relative"
            >
              <Link href={`/products/${product._id}`} className="block">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover mb-4 rounded"
                />
                <h3 className="font-bold mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-2">{product.description}</p>
                <p className="font-bold mb-4">₹{product.price}</p>
                {product.bestSeller && (
                  <div className="text-xs font-semibold text-yellow-600">
                    ★ Best Seller
                  </div>
                )}
              </Link>
              <button
                onClick={() => addToCart(product._id)}
                className="absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
