// Authentication service for API calls

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserSignUpData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  country?: string;
  favoriteSport?: string;
  interests?: string[];
  inviterCode?: string;
}

export interface ShopSignUpData {
  shopName: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  country?: string;
  inviterCode?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: any;
  shop?: any;
  message?: string;
}

// Use import.meta.env for Vite environment variables
const API_BASE_URL = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 
  '/api';

class AuthService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'An error occurred');
    }

    return data;
  }

  // User Authentication
  async loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      return await this.request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    } catch (error: any) {
      throw new Error(error.message || 'Login failed. Please check your credentials.');
    }
  }

  async signUpUser(data: UserSignUpData): Promise<AuthResponse> {
    try {
      // Format date of birth if exists
      const formattedData = {
        ...data,
        dateOfBirth: data.dateOfBirth || undefined,
      };

      return await this.request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(formattedData),
      });
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed. Please try again.');
    }
  }

  // Shop Authentication
  async loginShop(credentials: LoginCredentials): Promise<AuthResponse> {
    const endpoints = [
      '/shop/auth/login',
      '/shops/auth/login',
      '/shop/login',
      '/shops/login',
    ];

    for (const endpoint of endpoints) {
      try {
        return await this.request<AuthResponse>(endpoint, {
          method: 'POST',
          body: JSON.stringify(credentials),
        });
      } catch (error) {
        continue;
      }
    }

    throw new Error('Login failed. Please check your credentials.');
  }

  async signUpShop(data: ShopSignUpData): Promise<AuthResponse> {
    const endpoints = [
      '/shop/auth/register',
      '/shops/auth/register',
      '/shop/register',
      '/shops/register',
    ];

    const formattedData = {
      ...data,
      name: data.shopName, // Include both formats
      dateOfBirth: data.dateOfBirth || undefined,
    };

    for (const endpoint of endpoints) {
      try {
        return await this.request<AuthResponse>(endpoint, {
          method: 'POST',
          body: JSON.stringify(formattedData),
        });
      } catch (error) {
        continue;
      }
    }

    throw new Error('Shop registration failed. Please try again.');
  }

  // Token management
  saveToken(token: string, type: 'user' | 'shop') {
    localStorage.setItem(`${type}Token`, token);
  }

  getToken(type: 'user' | 'shop'): string | null {
    return localStorage.getItem(`${type}Token`);
  }

  removeToken(type: 'user' | 'shop') {
    localStorage.removeItem(`${type}Token`);
  }

  logout(type: 'user' | 'shop') {
    this.removeToken(type);
    localStorage.removeItem(type);
  }
}

export const authService = new AuthService();
