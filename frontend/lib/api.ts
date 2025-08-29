import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const login = async (email: string, password: string) => {
  const response = await axios.post(`${API_URL}/auth/login`, { email, password });
  return response.data;
};

export const register = async (username: string, email: string, password: string, contact: string) => {
  const response = await axios.post(`${API_URL}/auth/register`, { username, email, password, contact });
  return response.data;
};

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  bestSeller?: boolean; // Now optional
}

export async function getProducts(): Promise<Product[]> {
  const response = await axios.get(`${API_URL}/products`);
  // If your backend returns { data: [...] }
  return response.data;
}

export async function getBestSellers(): Promise<Product[]> {
  const response = await axios.get(`${API_URL}/products/best-sellers`);
  // If your backend returns { data: [...] }
  return response.data.data;
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const response = await axios.get(`${API_URL}/products/category/${category}`);
  // If your backend returns { data: [...] }
  return response.data.data;
}

export async function getProductById(id: string): Promise<Product> {
  const response = await axios.get(`${API_URL}/products/${id}`);
  return response.data;
}

interface CartItem {
  product: string;
  quantity: number;
}

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

// Get user orders
export async function getUserOrders(token: string): Promise<any> {
  const response = await axios.get(`${API_URL}/orders/user`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

// Get user profile
export async function getUserProfile(token: string): Promise<any> {
  const response = await axios.get(`${API_URL}/users/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

// Update user profile
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
