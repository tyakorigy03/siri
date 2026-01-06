// Base API client using fetch
import { API_CONFIG, getAuthToken, removeAuthToken, removeUserData } from '../config/api';

/**
 * Base API request function
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {object} options - Fetch options
 * @returns {Promise} - Response data
 */
export const apiRequest = async (endpoint, options = {}) => {
  const { method = 'GET', body, headers = {}, ...restOptions } = options;
  
  // Get auth token
  const token = getAuthToken();
  
  // Prepare headers
  const requestHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };
  
  // Add authorization header if token exists
  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  // Prepare request config
  const config = {
    method,
    headers: requestHeaders,
    ...restOptions,
  };
  
  // Add body for non-GET requests
  if (body && method !== 'GET') {
    if (body instanceof FormData) {
      // Remove Content-Type for FormData (browser will set it with boundary)
      delete config.headers['Content-Type'];
      config.body = body;
    } else {
      config.body = JSON.stringify(body);
    }
  }
  
  try {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const response = await fetch(url, config);
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    // Handle unauthorized (401) - token expired or invalid
    if (response.status === 401) {
      removeAuthToken();
      removeUserData();
      
      // Show error message before redirecting
      // Use dynamic import to avoid circular dependencies
      import('../utils/toast').then(({ showError }) => {
        showError('Session expired. Please login again.');
      }).catch(() => {
        // Fallback if toast import fails
        console.error('Session expired. Please login again.');
      });
      
      // Redirect to login after a short delay to allow toast to show
      if (window.location.pathname !== '/') {
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      }
      
      const error = new Error('Unauthorized. Please login again.');
      error.status = 401;
      throw error;
    }
    
    // Handle errors
    if (!response.ok) {
      const errorMessage = data?.message || data?.error?.message || `HTTP error! status: ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }
    
    return data;
    
  } catch (error) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
};

/**
 * GET request
 */
export const get = (endpoint, params = {}) => {
  // Build query string
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;
  return apiRequest(url, { method: 'GET' });
};

/**
 * POST request
 */
export const post = (endpoint, body, options = {}) => {
  return apiRequest(endpoint, {
    method: 'POST',
    body,
    ...options,
  });
};

/**
 * PUT request
 */
export const put = (endpoint, body, options = {}) => {
  return apiRequest(endpoint, {
    method: 'PUT',
    body,
    ...options,
  });
};

/**
 * DELETE request
 */
export const del = (endpoint, options = {}) => {
  return apiRequest(endpoint, {
    method: 'DELETE',
    ...options,
  });
};

/**
 * PATCH request
 */
export const patch = (endpoint, body, options = {}) => {
  return apiRequest(endpoint, {
    method: 'PATCH',
    body,
    ...options,
  });
};
