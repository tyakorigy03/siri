// Reports Service
import { get } from './api';

/**
 * Get sales report
 * @param {object} filters - { branch_id, date_from, date_to, group_by }
 * @returns {Promise} - Sales report data
 */
export const getSalesReport = async (filters = {}) => {
  try {
    const response = await get('/reports/sales', filters);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get inventory report
 * @param {object} filters - { branch_id, warehouse_id, date }
 * @returns {Promise} - Inventory report data
 */
export const getInventoryReport = async (filters = {}) => {
  try {
    const response = await get('/reports/inventory', filters);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get financial report
 * @param {object} filters - { branch_id, date_from, date_to }
 * @returns {Promise} - Financial report data
 */
export const getFinancialReport = async (filters = {}) => {
  try {
    const response = await get('/reports/financial', filters);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get daily report
 * @param {object} filters - { branch_id, date }
 * @returns {Promise} - Daily report data
 */
export const getDailyReport = async (filters = {}) => {
  try {
    const response = await get('/reports/daily', filters);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get VAT report
 * @param {object} filters - { branch_id, date_from, date_to }
 * @returns {Promise} - VAT report data
 */
export const getVATReport = async (filters = {}) => {
  try {
    const response = await get('/reports/vat', filters);
    return response.data;
  } catch (error) {
    throw error;
  }
};
