// Authentication Service
import { post, get } from './api';
import { setAuthToken, setUserData, removeAuthToken, removeUserData, getAuthToken, getUserData as getUserDataFromStorage } from '../config/api';

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} - User data and token
 */
export const login = async (email, password) => {
  try {
    const response = await post('/auth/login', { email, password });
    
    if (response.success && response.data) {
      // Store token and user data
      setAuthToken(response.data.token);
      setUserData(response.data.user);
      return response.data;
    }
    
    throw new Error(response.message || 'Login failed');
  } catch (error) {
    throw error;
  }
};

/**
 * Register new user
 * @param {object} userData - User registration data
 * @returns {Promise} - User data and token
 */
export const register = async (userData) => {
  try {
    const response = await post('/auth/register', userData);
    
    if (response.success && response.data) {
      // Store token and user data
      setAuthToken(response.data.token);
      setUserData(response.data.user);
      return response.data;
    }
    
    throw new Error(response.message || 'Registration failed');
  } catch (error) {
    throw error;
  }
};

/**
 * Get current user profile
 * @returns {Promise} - Current user data
 */
export const getCurrentUser = async () => {
  try {
    const response = await get('/auth/me');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Logout user
 */
export const logout = () => {
  removeAuthToken();
  removeUserData();
  // Redirect to login
  window.location.href = '/';
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const token = getAuthToken();
  const user = getUserDataFromStorage();
  return !!(token && user);
};
