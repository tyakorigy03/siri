// Branches Service
import { get, post, put } from './api';

/**
 * Get branches list
 * @param {object} filters - { business_id, active }
 * @returns {Promise} - Branches list
 */
export const getBranches = async (filters = {}) => {
  try {
    const response = await get('/branches', filters);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get single branch
 * @param {string} branchId - Branch ID
 * @returns {Promise} - Branch details
 */
export const getBranch = async (branchId) => {
  try {
    const response = await get(`/branches/${branchId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create branch
 * @param {object} branchData - Branch data
 * @returns {Promise} - Created branch
 */
export const createBranch = async (branchData) => {
  try {
    const response = await post('/branches', branchData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update branch
 * @param {string} branchId - Branch ID
 * @param {object} branchData - Branch data
 * @returns {Promise} - Updated branch
 */
export const updateBranch = async (branchId, branchData) => {
  try {
    const response = await put(`/branches/${branchId}`, branchData);
    return response.data;
  } catch (error) {
    throw error;
  }
};
