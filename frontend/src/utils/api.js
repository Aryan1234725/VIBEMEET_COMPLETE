import axios from 'axios';

// Base URL for the backend API
const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://vibemeet-complete-6.onrender.com/api/v1"
    : "http://localhost:8080/api/v1";

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// User Authentication API
export const userAPI = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/users/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/users/login', credentials);
    return response.data;
  },

  // Add meeting activity
  addActivity: async (meetingCode) => {
    const token = localStorage.getItem('token');
    const response = await api.post('/users/add_to_activity', {
      token,
      meeting_code: meetingCode,
    });
    return response.data;
  },

  // Get all user activities
  getAllActivities: async () => {
    const token = localStorage.getItem('token');
    const response = await api.get('/users/get_all_activity', {
      params: { token },
    });
    return response.data;
  },
};

// Payment API
export const paymentAPI = {
  // Create payment order
  createOrder: async (plan) => {
    const token = localStorage.getItem('token');
    const response = await api.post('/payments/create_order', {
      token,
      plan,
    });
    return response.data;
  },

  // Verify payment
  verifyPayment: async (paymentData) => {
    const token = localStorage.getItem('token');
    const response = await api.post('/payments/verify_payment', {
      token,
      ...paymentData,
    });
    return response.data;
  },
};

// Utility function to handle API errors
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.message || error.response.data?.error || 'Server error occurred';
    throw new Error(message);
  } else if (error.request) {
    // Request was made but no response received
    throw new Error('Network error. Please check your connection.');
  } else {
    // Something else happened
    throw new Error(error.message || 'An unexpected error occurred.');
  }
};

export default api;
