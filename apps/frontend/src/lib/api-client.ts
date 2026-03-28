import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // Server responded with error
      const { status, data } = error.response;
      
      if (status === 401) {
        // Clear invalid token and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('userEmail');
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
      }
      
      return Promise.reject({
        status,
        message: (data as { message?: string })?.message || 'An error occurred',
        data,
      });
    }
    
    if (error.request) {
      // Request made but no response
      return Promise.reject({
        status: 0,
        message: 'Network error. Please check your connection.',
      });
    }
    
    return Promise.reject({
      status: 0,
      message: error.message || 'An unexpected error occurred',
    });
  }
);

// Auth API helpers
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/api/auth/login', { email, password }),
  
  register: (email: string, password: string, role?: string) =>
    apiClient.post('/api/auth/register', { email, password, role }),
};

// Product API helpers
export const productsApi = {
  getAll: () => apiClient.get('/api/products'),
  getById: (id: number) => apiClient.get(`/products/${id}`),
  create: (data: { name: string; description?: string; price: number; quantity: number; categoryId?: number }) =>
    apiClient.post('/products', data),
  update: (id: number, data: Partial<{ name: string; description: string; price: number; quantity: number; categoryId: number }>) =>
    apiClient.patch(`/products/${id}`, data),
  delete: (id: number) => apiClient.delete(`/products/${id}`),
};

// Cart API helpers
export const cartApi = {
  getCart: () => apiClient.get('api/orders/my-cart'),
  addToCart: (productId: number, quantity: number) =>
    apiClient.post('/orders/my-cart', { productId, quantity }),
  updateCartItem: (productId: number, quantity: number) =>
    apiClient.patch('/orders/my-cart', { productId, quantity }),
  removeFromCart: (productId: number) =>
    apiClient.delete(`/orders/my-cart/${productId}`),
  clearCart: () => apiClient.delete('/orders/my-cart'),
};

export default apiClient;
