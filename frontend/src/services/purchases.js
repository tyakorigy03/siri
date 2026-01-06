// Purchases Service
import { get, post, put } from './api';

/**
 * Get purchase orders
 * @param {object} filters - { branch_id, status, supplier_id, date_from, date_to, page, limit }
 * @returns {Promise} - Purchase orders list
 */
export const getPurchaseOrders = async (filters = {}) => {
  try {
    const response = await get('/purchases/orders', filters);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get single purchase order
 * @param {string} orderId - Purchase order ID
 * @returns {Promise} - Purchase order details
 */
export const getPurchaseOrder = async (orderId) => {
  try {
    const response = await get(`/purchases/orders/${orderId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create purchase order
 * @param {object} orderData - Purchase order data
 * @returns {Promise} - Created purchase order
 */
export const createPurchaseOrder = async (orderData) => {
  try {
    const response = await post('/purchases/orders', orderData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Approve purchase order
 * @param {string} orderId - Purchase order ID
 * @returns {Promise} - Updated purchase order
 */
export const approvePurchaseOrder = async (orderId) => {
  try {
    const response = await put(`/purchases/orders/${orderId}/approve`, {});
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Reject purchase order
 * @param {string} orderId - Purchase order ID
 * @param {string} rejectionReason - Rejection reason
 * @returns {Promise} - Updated purchase order
 */
export const rejectPurchaseOrder = async (orderId, rejectionReason) => {
  try {
    const response = await put(`/purchases/orders/${orderId}/reject`, { rejection_reason: rejectionReason });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get purchase invoices
 * @param {object} filters - { branch_id, supplier_id, status, date_from, date_to, page, limit }
 * @returns {Promise} - Purchase invoices list
 */
export const getPurchaseInvoices = async (filters = {}) => {
  try {
    const response = await get('/purchases/invoices', filters);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create purchase invoice
 * @param {object} invoiceData - Purchase invoice data
 * @returns {Promise} - Created purchase invoice
 */
export const createPurchaseInvoice = async (invoiceData) => {
  try {
    const response = await post('/purchases/invoices', invoiceData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Pay supplier (mark purchase invoice as paid)
 * @param {string} invoiceId - Purchase invoice ID
 * @param {object} paymentData - Payment data
 * @returns {Promise} - Updated invoice
 */
export const paySupplier = async (invoiceId, paymentData) => {
  try {
    const response = await post(`/purchases/invoices/${invoiceId}/pay`, paymentData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get accounts payable
 * @param {object} filters - { branch_id, supplier_id, overdue_only }
 * @returns {Promise} - Accounts payable list
 */
export const getAccountsPayable = async (filters = {}) => {
  try {
    const response = await get('/purchases/payables', filters);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get suppliers list
 * @param {object} filters - { business_id, active }
 * @returns {Promise} - Suppliers list
 */
export const getSuppliers = async (filters = {}) => {
  try {
    const response = await get('/purchases/suppliers', filters);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get warehouses list
 * @param {object} filters - { business_id, branch_id, active }
 * @returns {Promise} - Warehouses list
 */
export const getWarehouses = async (filters = {}) => {
  try {
    const response = await get('/purchases/warehouses', filters);
    return response.data;
  } catch (error) {
    throw error;
  }
};
