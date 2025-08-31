// lib/api.ts
import { getAuthHeaders, getAdminToken } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  bestSeller?: boolean;
  createdAt?: string;
  imagePublicId?: string;
}

export interface Order {
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

export interface User {
  _id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

// Error handling utility
async function handleResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }
  return response.json();
}

// PRODUCT API FUNCTIONS

// Get all products (public)
export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/products`);
  return handleResponse(response);
}

// Get single product by ID (public)
export async function getProduct(id: string): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/products/${id}`);
  return handleResponse(response);
}

// Get products by category (public)
export async function getProductsByCategory(category: string): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/products/category/${category}`);
  return handleResponse(response);
}

// Get best sellers (public)
export async function getBestSellers(): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/products/best-sellers`);
  return handleResponse(response);
}

// Add new product with image (admin only)
export async function addProduct(formData: FormData, token: string): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  return handleResponse(response);
}

// Update product (admin only)
export async function updateProduct(id: string, formData: FormData, token: string): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  return handleResponse(response);
}

// Delete product (admin only)
export async function deleteProduct(id: string, token: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to delete product');
  }
}

// ORDER API FUNCTIONS

// lib/api.ts
export async function getAllOrders(token: string): Promise<Order[]> {
  try {
    console.log('Making request to:', `${API_BASE_URL}/orders`);
    
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Parsed data:', data);
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Get order by ID (admin only)
export async function getOrder(id: string, token: string): Promise<Order> {
  const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
}

// lib/api.ts
// Update order status (admin only)
export async function updateOrderStatus(id: string, status: string, token: string): Promise<Order> {
  const response = await fetch(`${API_BASE_URL}/orders/${id}`, {  // Note: /orders/:id not /orders/status
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),  // Send status in body
  });
  return handleResponse(response);
}


// USER API FUNCTIONS

// Get all users (admin only)
export async function getAllUsers(token: string): Promise<User[]> {
  const response = await fetch(`${API_BASE_URL}/users`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
}

// Get user by ID (admin only)
export async function getUser(id: string, token: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
}

// DASHBOARD STATS API FUNCTIONS

// Get admin dashboard stats (admin only)
// lib/api.ts (add this function)
export async function getDashboardStats(token: string): Promise<{
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  recentOrders: any[];
}> {
  const response = await fetch(`${API_BASE_URL}/admin/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
}


// UTILITY FUNCTIONS

// Generic authenticated fetch helper
export async function fetchWithAuth(
  endpoint: string, 
  options: RequestInit = {}
): Promise<any> {
  const token = getAdminToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });

  return handleResponse(response);
}

// Check if API is available
export async function checkAPIHealth(): Promise<{ status: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return handleResponse(response);
  } catch (error) {
    throw new Error('API is not available');
  }
}
