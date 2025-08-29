'use client';

import { useEffect, useState } from 'react';
import { getProductById } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/app/context/user-context';
import { useCart } from '@/app/context/cart-context';
import { placeOrder } from '@/lib/api';

// If you use a shared Product interface, import it instead
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  bestSeller?: boolean;
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useUser();
  const { cart, addToCart } = useCart();
  const router = useRouter();

  // Fetch product by ID
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id as string);
        setProduct(data);
        setLoading(false);
      } catch (err) {
        setError('Product not found.');
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user?.token) {
      alert('Please log in to add items to your cart.');
      return;
    }
    if (!product) return;

    // Optimistic update: Add to client-side cart
    addToCart(product._id);

    try {
      // Prepare cart items for backend
      const currentCartItems = cart.map((item) => ({
        product: item.productId,
        quantity: item.quantity,
      }));
      // Add the current product (if not already in cart)
      if (!cart.some((item) => item.productId === product._id)) {
        currentCartItems.push({ product: product._id, quantity: 1 });
      }

      // Calculate total amount (simplified for demo—adjust for your logic)
      // This assumes all products in cart are this same product for proof of concept
      const totalAmount =
        currentCartItems.reduce(
          (sum, item) => sum + (item.quantity * product.price),
          0
        );

      // Call backend to update cart
      await placeOrder(currentCartItems, totalAmount, user.token);
      // If backend returns an updated cart, you can sync here if needed
      // Redirect or provide feedback
      router.push('/cart');
    } catch (err) {
      console.error('Failed to add to cart:', err);
      // Optionally: Roll back optimistic update, show error
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!product) return <div className="p-8 text-center">Product not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        href="/products"
        className="mb-6 inline-flex items-center text-blue-500 hover:underline"
      >
        ← Back to Products
      </Link>

      <div className="flex flex-col md:flex-row gap-8">
        <img
          src={product.image}
          alt={product.name}
          className="w-full md:w-1/2 h-96 object-cover rounded-lg"
        />

        <div className="w-full md:w-1/2">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs mb-6">
            {product.category}
          </span>
          {product.bestSeller && (
            <span className="ml-2 inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs mb-6">
              ★ Best Seller
            </span>
          )}
          <p className="text-gray-700 mb-4">{product.description}</p>
          <p className="text-2xl font-bold mb-8">₹{product.price}</p>
          <button
            onClick={handleAddToCart}
            disabled={!user}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
