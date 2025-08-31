// lib/auth.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  token: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    isAdmin: boolean;
  };
}

// lib/auth.ts
export async function adminLogin(email: string, password: string): Promise<AdminUser> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Login failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // Debug: Log the response to see what we're getting
    console.log('Login response:', data);

    // Check if user object exists in response
    if (!data.user) {
      console.error('Backend returned:', data);
      throw new Error('Backend error: missing user object in login response');
    }

    // Check if user has admin privileges
    if (!data.user.isAdmin) {
      throw new Error('Access denied: Admin privileges required');
    }

    return {
      id: data.user.id,
      username: data.user.username,
      email: data.user.email,
      isAdmin: data.user.isAdmin,
      token: data.token,
    };
  } catch (error) {
    console.error('Login error details:', error);
    throw error;
  }
}



// Save admin data to localStorage
export function saveAdminToStorage(admin: AdminUser): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('adminToken', admin.token);
    localStorage.setItem('adminData', JSON.stringify({
      id: admin.id,
      username: admin.username,
      email: admin.email,
      isAdmin: admin.isAdmin,
    }));
  }
}

// Clear admin data from localStorage
export function clearAdminFromStorage(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
  }
}

// Get admin token from localStorage
export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('adminToken');
}

// Get admin data from localStorage
export function getStoredAdminData(): Partial<AdminUser> | null {
  if (typeof window === 'undefined') return null;
  
  const data = localStorage.getItem('adminData');
  if (!data) return null;
  
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

// Restore admin session from localStorage
export function restoreAdminSession(): AdminUser | null {
  const token = getAdminToken();
  const adminData = getStoredAdminData();
  
  if (!token || !adminData || !adminData.isAdmin) {
    return null;
  }

  return {
    id: adminData.id || '',
    username: adminData.username || '',
    email: adminData.email || '',
    isAdmin: adminData.isAdmin || false,
    token: token,
  };
}

// Check if admin is authenticated
export function isAdminAuthenticated(): boolean {
  const admin = restoreAdminSession();
  return admin !== null && admin.isAdmin === true;
}

// Get authorization headers for API requests
export function getAuthHeaders(): HeadersInit {
  const token = getAdminToken();
  return {
    'Authorization': token ? `Bearer ${token}` : '',
  };
}

// Logout admin
export function logoutAdmin(): void {
  clearAdminFromStorage();
}

// Validate token expiration (optional - implement if your JWT has exp)
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch {
    return true; // If we can't decode it, consider it expired
  }
}
