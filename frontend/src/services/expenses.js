// Expenses Service
import { get, post, put } from './api';

/**
 * Get expenses
 * @param {object} filters - { branch_id, category_id, status, date_from, date_to, page, limit }
 * @returns {Promise} - Expenses list
 */
export const getExpenses = async (filters = {}) => {
  try {
    const response = await get('/expenses', filters);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get single expense
 * @param {string} expenseId - Expense ID
 * @returns {Promise} - Expense details
 */
export const getExpense = async (expenseId) => {
  try {
    const response = await get(`/expenses/${expenseId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create expense
 * @param {FormData|object} expenseData - Expense data (can be FormData if uploading receipt)
 * @returns {Promise} - Created expense
 */
export const createExpense = async (expenseData) => {
  try {
    const isFormData = expenseData instanceof FormData;
    const response = await post('/expenses', expenseData, {
      headers: isFormData ? {} : { 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Approve expense
 * @param {string} expenseId - Expense ID
 * @param {object} data - Approval data (optional notes)
 * @returns {Promise} - Updated expense
 */
export const approveExpense = async (expenseId, data = {}) => {
  try {
    const response = await put(`/expenses/${expenseId}/approve`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Reject expense
 * @param {string} expenseId - Expense ID
 * @param {string} rejectionReason - Rejection reason
 * @returns {Promise} - Updated expense
 */
export const rejectExpense = async (expenseId, rejectionReason) => {
  try {
    const response = await put(`/expenses/${expenseId}/reject`, { rejection_reason: rejectionReason });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Mark expense as paid
 * @param {string} expenseId - Expense ID
 * @param {object} paymentData - Payment data
 * @returns {Promise} - Updated expense
 */
export const markExpenseAsPaid = async (expenseId, paymentData = {}) => {
  try {
    const response = await put(`/expenses/${expenseId}/pay`, paymentData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get expense summary
 * @param {object} filters - { branch_id, date_from, date_to }
 * @returns {Promise} - Expense summary
 */
export const getExpenseSummary = async (filters = {}) => {
  try {
    const response = await get('/expenses/summary', filters);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get expense categories
 * @returns {Promise} - Expense categories
 */
export const getExpenseCategories = async () => {
  try {
    const response = await get('/expenses/categories');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create expense category
 * @param {object} categoryData - Category data
 * @returns {Promise} - Created category
 */
export const createExpenseCategory = async (categoryData) => {
  try {
    const response = await post('/expenses/categories', categoryData);
    return response.data;
  } catch (error) {
    throw error;
  }
};
