import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = async (username: string, password: string) => {
  const response = await api.post('/api-auth/login/', { username, password });
  return response.data;
};

// Categories
export const getCategories = async (params?: any) => {
  const response = await api.get('/categories/', { params });
  return response.data;
};

export const createCategory = async (data: any) => {
  const response = await api.post('/categories/', data);
  return response.data;
};

export const updateCategory = async (id: number, data: any) => {
  const response = await api.put(`/categories/${id}/`, data);
  return response.data;
};

export const deleteCategory = async (id: number) => {
  const response = await api.delete(`/categories/${id}/`);
  return response.data;
};

// Suppliers
export const getSuppliers = async (params?: any) => {
  const response = await api.get('/suppliers/', { params });
  return response.data;
};

export const createSupplier = async (data: any) => {
  const response = await api.post('/suppliers/', data);
  return response.data;
};

export const updateSupplier = async (id: number, data: any) => {
  const response = await api.put(`/suppliers/${id}/`, data);
  return response.data;
};

export const deleteSupplier = async (id: number) => {
  const response = await api.delete(`/suppliers/${id}/`);
  return response.data;
};

// Products
export const getProducts = async (params?: any) => {
  const response = await api.get('/products/', { params });
  return response.data;
};

export const getProduct = async (id: number) => {
  const response = await api.get(`/products/${id}/`);
  return response.data;
};

export const createProduct = async (data: any) => {
  const response = await api.post('/products/', data);
  return response.data;
};

export const updateProduct = async (id: number, data: any) => {
  const response = await api.put(`/products/${id}/`, data);
  return response.data;
};

export const deleteProduct = async (id: number) => {
  const response = await api.delete(`/products/${id}/`);
  return response.data;
};

export const getLowStockProducts = async () => {
  const response = await api.get('/products/low_stock/');
  return response.data;
};

export const getOutOfStockProducts = async () => {
  const response = await api.get('/products/out_of_stock/');
  return response.data;
};

export const getStockReport = async () => {
  const response = await api.get('/products/stock_report/');
  return response.data;
};

// Inventory Items
export const getInventoryItems = async (params?: any) => {
  const response = await api.get('/inventory-items/', { params });
  return response.data;
};

export const createInventoryItem = async (data: any) => {
  const response = await api.post('/inventory-items/', data);
  return response.data;
};

export const updateInventoryItem = async (id: number, data: any) => {
  const response = await api.put(`/inventory-items/${id}/`, data);
  return response.data;
};

// Transactions
export const getTransactions = async (params?: any) => {
  const response = await api.get('/transactions/', { params });
  return response.data;
};

export const createTransaction = async (data: any) => {
  const response = await api.post('/transactions/', data);
  return response.data;
};

export default api;