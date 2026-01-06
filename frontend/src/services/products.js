// Products Service
import { get, post, put, del } from './api';

/**
 * Get products list
 * @param {object} filters - { search, category, active, page, limit }
 * @returns {Promise} - Products list
 */
export const getProducts = async (filters = {}) => {
  try {
    const response = await get('/products', filters);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get single product
 * @param {string} productId - Product ID
 * @returns {Promise} - Product details
 */
export const getProduct = async (productId) => {
  try {
    const response = await get(`/products/${productId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create product
 * @param {FormData|object} productData - Product data (can be FormData if uploading image)
 * @returns {Promise} - Created product
 */
export const createProduct = async (productData) => {
  try {
    const isFormData = productData instanceof FormData;
    const response = await post('/products', productData, {
      headers: isFormData ? {} : { 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update product
 * @param {string} productId - Product ID
 * @param {FormData|object} productData - Product data
 * @returns {Promise} - Updated product
 */
export const updateProduct = async (productId, productData) => {
  try {
    const isFormData = productData instanceof FormData;
    const response = await put(`/products/${productId}`, productData, {
      headers: isFormData ? {} : { 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete product (soft delete)
 * @param {string} productId - Product ID
 * @returns {Promise} - Deletion result
 */
export const deleteProduct = async (productId) => {
  try {
    const response = await del(`/products/${productId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get product categories
 * @returns {Promise} - Product categories
 */
export const getProductCategories = async () => {
  try {
    const response = await get('/products/categories');
    return response.data;
  } catch (error) {
    throw error;
  }
};
