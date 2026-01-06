// Cash Sessions Service
import { get, post, put } from './api';

/**
 * Get cash sessions
 * @param {object} filters - { branch_id, user_id, status, date_from, date_to, page, limit }
 * @returns {Promise} - Cash sessions list
 */
export const getCashSessions = async (filters = {}) => {
  try {
    // Use /history endpoint which supports filters
    const response = await get('/staff-sessions/history', filters);
    // Backend returns { data: { data: [...], pagination: {...} } }
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return response.data || [];
  } catch (error) {
    throw error;
  }
};

/**
 * Get single cash session
 * @param {string} sessionId - Session ID
 * @returns {Promise} - Cash session details
 */
export const getCashSession = async (sessionId) => {
  try {
    const response = await get(`/staff-sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Open cash session
 * @param {object} sessionData - Session data
 * @returns {Promise} - Created session
 */
export const openCashSession = async (sessionData) => {
  try {
    const response = await post('/staff-sessions/open', sessionData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Close cash session
 * @param {string} sessionId - Session ID (or pass in closingData)
 * @param {object} closingData - Closing data { session_id, actual_cash, notes }
 * @returns {Promise} - Updated session
 */
export const closeCashSession = async (sessionId, closingData) => {
  try {
    // Backend expects { session_id, actual_cash, notes } in body
    const data = closingData || { session_id: sessionId };
    const response = await post('/staff-sessions/close', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get current cash session for logged-in user
 * @returns {Promise} - Current session or null
 */
export const getCurrentCashSession = async () => {
  try {
    const response = await get('/staff-sessions/current');
    return response.data;
  } catch (error) {
    throw error;
  }
};
