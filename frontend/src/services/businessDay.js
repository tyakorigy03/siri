// Business Day Service
import { post, get } from './api';

/**
 * Open business day
 * @param {object} data - { branch_id, opening_float, notes }
 * @returns {Promise} - Business day data
 */
export const openBusinessDay = async (data) => {
  try {
    const response = await post('/cashbook/business-day/open', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Close business day
 * @param {object} data - { business_day_id, actual_closing_cash, notes }
 * @returns {Promise} - Closing result
 */
export const closeBusinessDay = async (data) => {
  try {
    const response = await post('/cashbook/business-day/close', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get current business day
 * @param {number} branchId - Optional branch ID
 * @returns {Promise} - Current business day data
 */
export const getCurrentBusinessDay = async (branchId = null) => {
  try {
    const params = branchId ? { branch_id: branchId } : {};
    const response = await get('/cashbook/business-day/current', params);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get business day history
 * @param {object} filters - { branch_id, date_from, date_to, page, limit }
 * @returns {Promise} - Business day history
 */
export const getBusinessDayHistory = async (filters = {}) => {
  try {
    const response = await get('/cashbook/business-day/history', filters);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get cashbook entries
 * @param {object} filters - { business_day_id, branch_id, date_from, date_to, entry_type }
 * @returns {Promise} - Cashbook entries
 */
export const getCashbookEntries = async (filters = {}) => {
  try {
    const response = await get('/cashbook/entries', filters);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Add cashbook entry
 * @param {object} data - Entry data
 * @returns {Promise} - Created entry
 */
export const addCashbookEntry = async (data) => {
  try {
    const response = await post('/cashbook/entries', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get cash variance report
 * @param {object} filters - { branch_id, date_from, date_to }
 * @returns {Promise} - Variance report
 */
export const getCashVarianceReport = async (filters = {}) => {
  try {
    const response = await get('/cashbook/variance-report', filters);
    return response.data;
  } catch (error) {
    throw error;
  }
};
