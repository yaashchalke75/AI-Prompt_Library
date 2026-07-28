const { sendError } = require('../utils/apiResponse');
const env = require('../config/env');

/**
 * Catches unmatched routes.
 */
const notFoundHandler = (req, _res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Centralized error handler. Normalizes Mongoose errors, ApiErrors, and
 * unexpected exceptions into a single consistent response shape so the
 * frontend never has to guess the error format.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = err.errors;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.keys(err.errors).reduce((acc, key) => {
      acc[key] = err.errors[key].message;
      return acc;
    }, {});
  }

  // Mongoose invalid ObjectId cast
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for field "${err.path}"`;
  }

  // Mongo duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    message = 'A record with this value already exists';
  }

  // Never leak stack traces or internal details in production
  if (env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Something went wrong on our end. Please try again later.';
    errors = undefined;
  }

  if (env.NODE_ENV !== 'test') {
    // eslint-disable-next-line no-console
    console.error(`[error] ${req.method} ${req.originalUrl} ->`, err.message);
    if (statusCode === 500) {
      // eslint-disable-next-line no-console
      console.error(err.stack);
    }
  }

  return sendError(res, { statusCode, message, errors });
};

module.exports = { notFoundHandler, errorHandler };
