// Sales Service
import { get, post } from './api';

/**
 * Get sales list
 * @param {object} filters - { branch_id, date_from, date_to, customer_id, payment_method, page, limit }
 * @returns {Promise} - Sales list
 */
export const getSales = async (filters = {}) => {
  try {
    const response = await get('/sales', filters);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get single sale
 * @param {string} saleId - Sale ID
 * @returns {Promise} - Sale details
 */
export const getSale = async (saleId) => {
  try {
    const response = await get(`/sales/${saleId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create sale (POS transaction)
 * @param {object} saleData - Sale data
 * @returns {Promise} - Created sale
 */
export const createSale = async (saleData) => {
  try {
    const response = await post('/sales', saleData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Add payment to sale
 * @param {string} saleId - Sale ID
 * @param {object} paymentData - Payment data
 * @returns {Promise} - Updated sale
 */
export const addPaymentToSale = async (saleId, paymentData) => {
  try {
    const response = await post(`/sales/${saleId}/payment`, paymentData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get sales summary
 * @param {object} filters - { branch_id, date_from, date_to }
 * @returns {Promise} - Sales summary
 */
export const getSalesSummary = async (filters = {}) => {
  try {
    const response = await get('/sales/summary', filters);
    return response.data;
  } catch (error) {
    throw error;
  }
};
