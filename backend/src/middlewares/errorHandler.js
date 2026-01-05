
// src/middlewares/errorHandler.js - Global Error Handler
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  // MySQL duplicate key error
  if (err.code === 'ER_DUP_ENTRY') {
    const message = 'Duplicate field value entered';
    error = {
      message,
      statusCode: 400
    };
  }

  // MySQL foreign key constraint error
  if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_NO_REFERENCED_ROW_2') {
    const message = 'Cannot delete or update record due to existing references';
    error = {
      message,
      statusCode: 400
    };
  }

  // MySQL syntax error
  if (err.code === 'ER_PARSE_ERROR') {
    const message = 'Database query error';
    error = {
      message,
      statusCode: 500
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = {
      message,
      statusCode: 401
    };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = {
      message,
      statusCode: 401
    };
  }

  // Validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = {
      message,
      statusCode: 400
    };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;