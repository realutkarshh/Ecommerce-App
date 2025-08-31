import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// ========== AUTHENTICATION APIs ==========

export const login = async (email: string, password: string) => {
  const response = await axios.post(`${API_URL}/auth/login`, { email, password });
  return response.data;
};

export const register = async (username: string, email: string, password: string, contact: string) => {
  const response = await axios.post(`${API_URL}/auth/register`, { username, email, password, contact });
  return response.data;
};

// ========== TYPE DEFINITIONS ==========

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  bestSeller?: boolean;
}

interface CartItem {
  product: string;
  quantity: number;
}

interface Order {
  _id: string;
  user: string;
  items: {
    product: Product;
    quantity: number;
  }[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

// ========== PRODUCT APIs ==========

export async function getProducts(): Promise<Product[]> {
  const response = await axios.get(`${API_URL}/products`);
  return response.data;
}

export async function getBestSellers(): Promise<Product[]> {
  const response = await axios.get(`${API_URL}/products/best-sellers`);
  return response.data;
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const response = await axios.get(`${API_URL}/products/category/${category}`);
  return response.data;
}

export async function getProductById(id: string): Promise<Product> {
  const response = await axios.get(`${API_URL}/products/${id}`);
  return response.data;
}

// ========== USER WISHLIST APIs ==========

export async function getUserWishlist(token: string): Promise<Product[]> {
  console.log('=== FRONTEND WISHLIST REQUEST ===');
  console.log('API_URL:', API_URL);
  console.log('Token exists:', !!token);
  console.log('Token preview:', token?.substring(0, 30) + '...');
  
  try {
    const response = await axios.get(`${API_URL}/users/wishlist`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    console.log('Wishlist response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Wishlist API error:', error.response?.data || error.message);
    throw error;
  }
}

export async function addToWishlist(productId: string, token: string): Promise<Product[]> {
  const response = await axios.post(`${API_URL}/users/wishlist/${productId}`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function removeFromWishlist(productId: string, token: string): Promise<Product[]> {
  const response = await axios.delete(`${API_URL}/users/wishlist/${productId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function checkInWishlist(productId: string, token: string): Promise<{ isInWishlist: boolean }> {
  const response = await axios.get(`${API_URL}/users/wishlist/check/${productId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

// ========== USER CART APIs ==========

export async function getUserCart(token: string): Promise<any> {
  console.log('=== FRONTEND CART REQUEST ===');
  console.log('API_URL:', API_URL);
  console.log('Token exists:', !!token);
  console.log('Token preview:', token?.substring(0, 30) + '...');
  
  try {
    const response = await axios.get(`${API_URL}/users/cart`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    console.log('Cart response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Cart API error:', error.response?.data || error.message);
    throw error;
  }
}

export async function addToCart(productId: string, quantity: number, token: string): Promise<any> {
  const response = await axios.post(`${API_URL}/users/cart/${productId}`, { quantity }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function updateCartQuantity(productId: string, quantity: number, token: string): Promise<any> {
  const response = await axios.put(`${API_URL}/users/cart/${productId}`, { quantity }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function removeFromCart(productId: string, token: string): Promise<any> {
  const response = await axios.delete(`${API_URL}/users/cart/${productId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function clearCart(token: string): Promise<any> {
  const response = await axios.delete(`${API_URL}/users/cart`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function getCartCount(token: string): Promise<{ count: number }> {
  const response = await axios.get(`${API_URL}/users/cart/count`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

// ========== ORDER APIs ==========

export async function placeOrder(
  items: CartItem[],
  totalAmount: number,
  token: string
): Promise<any> {
  const response = await axios.post(
    `${API_URL}/orders`,
    { items, totalAmount },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

export async function getUserOrders(token: string): Promise<Order[]> {
  const response = await axios.get(`${API_URL}/orders/user`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

// ========== USER PROFILE APIs ==========

export async function getUserProfile(token: string): Promise<any> {
  const response = await axios.get(`${API_URL}/users/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function updateUserProfile(
  token: string,
  data: { username: string; email: string; contact: string }
): Promise<any> {
  const response = await axios.patch(
    `${API_URL}/users/profile`,
    data,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
}

// ========== USER ADDRESS APIs ==========

export async function addAddress(
  token: string,
  address: { street: string; city: string; state: string; zip: string }
): Promise<any> {
  const response = await axios.post(
    `${API_URL}/user/addresses`,
    address,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
}

export async function getUserAddresses(token: string): Promise<any[]> {
  const response = await axios.get(`${API_URL}/user/addresses`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function updateAddress(
  token: string,
  addressId: string,
  address: { street: string; city: string; state: string; zip: string }
): Promise<any> {
  const response = await axios.put(
    `${API_URL}/user/addresses/${addressId}`,
    address,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
}

export async function deleteAddress(token: string, addressId: string): Promise<any> {
  const response = await axios.delete(`${API_URL}/user/addresses/${addressId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

// ========== UTILITY FUNCTIONS ==========

// Search products
export async function searchProducts(query: string): Promise<Product[]> {
  const response = await axios.get(`${API_URL}/products/search?q=${encodeURIComponent(query)}`);
  return response.data;
}

// Get product reviews (if you add reviews later)
export async function getProductReviews(productId: string): Promise<any[]> {
  const response = await axios.get(`${API_URL}/products/${productId}/reviews`);
  return response.data;
}

// Add product review (if you add reviews later)
export async function addProductReview(
  productId: string,
  review: { rating: number; comment: string },
  token: string
): Promise<any> {
  const response = await axios.post(
    `${API_URL}/products/${productId}/reviews`,
    review,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
}

// Check API health
export async function checkApiHealth(): Promise<{ status: string }> {
  const response = await axios.get(`${API_URL}/health`);
  return response.data;
}

// ========== ERROR HANDLING WRAPPER ==========

// Optional: Create a wrapper for better error handling
export const apiRequest = async (requestFn: () => Promise<any>) => {
  try {
    return await requestFn();
  } catch (error: any) {
    if (error.response) {
      // Server responded with error status
      throw new Error(error.response.data.message || error.response.data.error || 'Server error');
    } else if (error.request) {
      // Request made but no response received
      throw new Error('Network error. Please check your connection.');
    } else {
      // Something happened in setting up the request
      throw new Error('Request failed. Please try again.');
    }
  }
};

// Example usage of wrapper:
// const products = await apiRequest(() => getProducts());
