// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  TIMEOUT: 30000, // 30 seconds
};

// Get auth token from localStorage
export const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

// Set auth token in localStorage
export const setAuthToken = (token) => {
  localStorage.setItem('auth_token', token);
};

// Remove auth token from localStorage
export const removeAuthToken = () => {
  localStorage.removeItem('auth_token');
};

// Get user data from localStorage
export const getUserData = () => {
  const userStr = localStorage.getItem('user_data');
  return userStr ? JSON.parse(userStr) : null;
};

// Set user data in localStorage
export const setUserData = (user) => {
  localStorage.setItem('user_data', JSON.stringify(user));
};

// Remove user data from localStorage
export const removeUserData = () => {
  localStorage.removeItem('user_data');
};
