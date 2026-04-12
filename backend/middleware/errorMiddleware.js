/**
 * Global Error Handling Middleware for Express.
 * Catches all errors thrown in the application and returns a standardized JSON response.
 * Handles specific Mongoose errors to provide user-friendly messages.
 * 
 * @param {Error} err - The error object.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next function.
 */
const errorMiddleware = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for developers
  console.error('[GEVIBE ERROR LOG]', {
     name: err.name,
     message: err.message,
     timestamp: new Date().toISOString()
  });

  // Mongoose Bad ObjectId (Cast Error)
  if (err.name === 'CastError') {
    error.message = `Resource not found with id of ${err.value}`;
    error.statusCode = 404;
  }

  // Mongoose Duplicate Key (Unique Error)
  if (err.code === 11000) {
    error.message = 'Duplicate field value entered. Please use another value.';
    error.statusCode = 400;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    error.message = Object.values(err.errors).map(val => val.message).join(', ');
    error.statusCode = 400;
  }

  const statusCode = error.statusCode || 500;
  const status = statusCode >= 500 ? 'error' : 'fail';

  res.status(statusCode).json({
    status,
    message: error.message || 'Server Internal Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorMiddleware;
