// Customers Service
import { get, post, put, del } from './api';

/**
 * Get customers list
 * @param {object} filters - { search, group_id, credit_only, page, limit }
 * @returns {Promise} - Customers list
 */
export const getCustomers = async (filters = {}) => {
  try {
    const response = await get('/customers', filters);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get single customer
 * @param {string} customerId - Customer ID
 * @returns {Promise} - Customer details
 */
export const getCustomer = async (customerId) => {
  try {
    const response = await get(`/customers/${customerId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create customer
 * @param {object} customerData - Customer data
 * @returns {Promise} - Created customer
 */
export const createCustomer = async (customerData) => {
  try {
    const response = await post('/customers', customerData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update customer
 * @param {string} customerId - Customer ID
 * @param {object} customerData - Customer data
 * @returns {Promise} - Updated customer
 */
export const updateCustomer = async (customerId, customerData) => {
  try {
    const response = await put(`/customers/${customerId}`, customerData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete customer
 * @param {string} customerId - Customer ID
 * @returns {Promise} - Deletion result
 */
export const deleteCustomer = async (customerId) => {
  try {
    const response = await del(`/customers/${customerId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get customer statement
 * @param {string} customerId - Customer ID
 * @param {object} filters - { date_from, date_to }
 * @returns {Promise} - Customer statement
 */
export const getCustomerStatement = async (customerId, filters = {}) => {
  try {
    const response = await get(`/customers/${customerId}/statement`, filters);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get customer groups
 * @returns {Promise} - Customer groups
 */
export const getCustomerGroups = async () => {
  try {
    const response = await get('/customers/groups');
    return response.data;
  } catch (error) {
    throw error;
  }
};
