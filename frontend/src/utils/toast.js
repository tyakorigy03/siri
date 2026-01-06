// Toast notification utility
import { toast } from 'react-toastify';

/**
 * Show success toast
 * @param {string} message - Success message
 */
export const showSuccess = (message) => {
  toast.success(message, {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

/**
 * Show error toast
 * @param {string} message - Error message
 */
export const showError = (message) => {
  toast.error(message, {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

/**
 * Show warning toast
 * @param {string} message - Warning message
 */
export const showWarning = (message) => {
  toast.warning(message, {
    position: 'top-right',
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

/**
 * Show info toast
 * @param {string} message - Info message
 */
export const showInfo = (message) => {
  toast.info(message, {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

/**
 * Handle API error and show appropriate toast
 * @param {Error} error - Error object
 * @param {string} defaultMessage - Default error message if error.message is not available
 */
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  const message = error?.message || error?.toString() || defaultMessage;
  showError(message);
  console.error('API Error:', error);
};
