import axios from 'axios';

// Use environment variable for API URL, fallback to relative path for development
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const API_URL = `${API_BASE_URL}/api/v1`;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token added to request:', config.url, token.substring(0, 20) + '...');
    } else {
      console.log('⚠️ No token found for request:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('❌ 401 Unauthorized - токен невалидный или отсутствует');
      // Можно добавить автоматический logout
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
};

// Rooms API
export const roomsAPI = {
  getAll: (params) => api.get('/rooms', { params }),
  getById: (id) => api.get(`/rooms/${id}`),
  create: (data) => api.post('/rooms', data),
  update: (id, data) => api.put(`/rooms/${id}`, data),
  delete: (id) => api.delete(`/rooms/${id}`),
  uploadPhoto: (id, formData) =>
    api.post(`/rooms/${id}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deletePhoto: (photoId) => api.delete(`/rooms/photos/${photoId}`),
};

// Companies API
export const companiesAPI = {
  getAll: (params) => api.get('/companies', { params }),
  getById: (id) => api.get(`/companies/${id}`),
  create: (data) => api.post('/companies', data),
  update: (id, data) => api.put(`/companies/${id}`, data),
  delete: (id) => api.delete(`/companies/${id}`),
};

// Buildings API
export const buildingsAPI = {
  getAll: (params) => api.get('/buildings', { params }),
  getById: (id) => api.get(`/buildings/${id}`),
  create: (data) => api.post('/buildings', data),
  update: (id, data) => api.put(`/buildings/${id}`, data),
  delete: (id) => api.delete(`/buildings/${id}`),
};

// Leases API
export const leasesAPI = {
  getAll: (params) => api.get('/leases', { params }),
  getById: (id) => api.get(`/leases/${id}`),
  create: (data) => api.post('/leases', data),
  update: (id, data) => api.put(`/leases/${id}`, data),
  delete: (id) => api.delete(`/leases/${id}`),
  getPayments: (id) => api.get(`/leases/${id}/payments`),
  createPayment: (id, data) => api.post(`/leases/${id}/payments`, data),
};

// Reviews API
export const reviewsAPI = {
  getRoomReviews: (roomId) => api.get(`/rooms/${roomId}/reviews`),
  create: (data) => api.post('/reviews', data),
  delete: (id) => api.delete(`/reviews/${id}`),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// Favorites API
export const favoritesAPI = {
  getAll: () => api.get('/favorites'),
  add: (data) => api.post('/favorites', data),
  remove: (id) => api.delete(`/favorites/${id}`),
};

// Maintenance API
export const maintenanceAPI = {
  getAll: (params) => api.get('/maintenance', { params }),
  getById: (id) => api.get(`/maintenance/${id}`),
  create: (data) => api.post('/maintenance', data),
  update: (id, data) => api.put(`/maintenance/${id}`, data),
  delete: (id) => api.delete(`/maintenance/${id}`),
};

// Statistics API
export const statsAPI = {
  getStats: () => api.get('/stats'),
};

export default api;
