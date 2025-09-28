import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';


// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'https://code-mentor-cyan.vercel.app/api',
  timeout: 30000, // 30 seconds timeout for code analysis
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      throw new Error('Network error. Please check your connection.');
    }
    
    // Return the error with a user-friendly message
    const errorMessage = error.response?.data?.error || error.response?.data?.message || 'An error occurred';
    throw new Error(errorMessage);
  }
);

// API methods
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updatePreferences: (preferences) => api.put('/auth/preferences', preferences),
  updateGoals: (goals) => api.put('/auth/goals', goals),
  verify: () => api.get('/auth/verify')
};

export const reviewAPI = {
  analyze: (codeData) => api.post('/review/analyze', codeData),
  getResults: (reviewId) => api.get(`/review/results/${reviewId}`),
  getHistory: (params) => api.get('/review/history', { params }),
  resolveIssue: (reviewId, issueId) => api.put(`/review/resolve-issue/${reviewId}/${issueId}`),
  submitFeedback: (reviewId, feedback) => api.post(`/review/feedback/${reviewId}`, feedback),
  getResources: (category, params) => api.get(`/review/resources/${category}`, { params })
};

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getProgress: (params) => api.get('/analytics/progress', { params }),
  getComparative: () => api.get('/analytics/compare'),
  getInsights: () => api.get('/analytics/insights')
};

// Export the main api instance
export { api };