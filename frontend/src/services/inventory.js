// Inventory Service
import { get, post } from './api';

/**
 * Get stock levels
 * @param {object} filters - { warehouse_id, branch_id, product_id, low_stock_only, page, limit }
 * @returns {Promise} - Stock levels
 */
export const getStockLevels = async (filters = {}) => {
  try {
    const response = await get('/inventory/stock', filters);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get stock movements
 * @param {object} filters - { warehouse_id, branch_id, product_id, movement_type, date_from, date_to, page, limit }
 * @returns {Promise} - Stock movements
 */
export const getStockMovements = async (filters = {}) => {
  try {
    const response = await get('/inventory/movements', filters);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get inventory valuation
 * @param {object} filters - { warehouse_id, branch_id, date }
 * @returns {Promise} - Inventory valuation
 */
export const getInventoryValuation = async (filters = {}) => {
  try {
    const response = await get('/inventory/valuation', filters);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get low stock alerts
 * @param {object} filters - { warehouse_id, branch_id }
 * @returns {Promise} - Low stock alerts
 */
export const getLowStockAlerts = async (filters = {}) => {
  try {
    const response = await get('/inventory/alerts', filters);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create stock adjustment
 * @param {object} adjustmentData - Adjustment data
 * @returns {Promise} - Created adjustment
 */
export const createStockAdjustment = async (adjustmentData) => {
  try {
    const response = await post('/inventory/adjustment', adjustmentData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create stock transfer
 * @param {object} transferData - Transfer data
 * @returns {Promise} - Created transfer
 */
export const createStockTransfer = async (transferData) => {
  try {
    const response = await post('/inventory/transfer', transferData);
    return response.data;
  } catch (error) {
    throw error;
  }
};
