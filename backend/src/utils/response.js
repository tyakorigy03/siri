
// src/utils/response.js - Standardized API Response Helper
/**
 * Send success response
 * 
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {*} data - Response data
 * @param {object} pagination - Pagination info (optional)
 */
const successResponse = (res, statusCode = 200, message = 'Success', data = null, pagination = null) => {
  const response = {
    success: true,
    message
  };

  if (data !== null) {
    response.data = data;
  }

  if (pagination) {
    response.pagination = {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit)
    };
  }

  return res.status(statusCode).json(response);
};

/**
 * Send error response
 * 
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {object} error - Error details (optional)
 */
const errorResponse = (res, statusCode = 500, message = 'Internal Server Error', error = null) => {
  const response = {
    success: false,
    message
  };

  if (error && process.env.NODE_ENV === 'development') {
    response.error = {
      details: error.message || error,
      ...(error.stack && { stack: error.stack })
    };
  }

  return res.status(statusCode).json(response);
};

/**
 * Send created response (201)
 */
const createdResponse = (res, message = 'Resource created successfully', data = null) => {
  return successResponse(res, 201, message, data);
};

/**
 * Send not found response (404)
 */
const notFoundResponse = (res, message = 'Resource not found') => {
  return errorResponse(res, 404, message);
};

/**
 * Send bad request response (400)
 */
const badRequestResponse = (res, message = 'Bad request', error = null) => {
  return errorResponse(res, 400, message, error);
};

/**
 * Send unauthorized response (401)
 */
const unauthorizedResponse = (res, message = 'Unauthorized access') => {
  return errorResponse(res, 401, message);
};

/**
 * Send forbidden response (403)
 */
const forbiddenResponse = (res, message = 'Access forbidden') => {
  return errorResponse(res, 403, message);
};

/**
 * Send conflict response (409)
 */
const conflictResponse = (res, message = 'Resource conflict') => {
  return errorResponse(res, 409, message);
};

/**
 * Send paginated response
 */
const paginatedResponse = (res, data, page, limit, total, message = 'Success') => {
  return successResponse(res, 200, message, data, { page, limit, total });
};

module.exports = {
  successResponse,
  errorResponse,
  createdResponse,
  notFoundResponse,
  badRequestResponse,
  unauthorizedResponse,
  forbiddenResponse,
  conflictResponse,
  paginatedResponse
};