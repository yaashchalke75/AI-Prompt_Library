/**
 * Standard success response shape used across all endpoints:
 * { success: true, data, message? , meta? }
 */
const sendSuccess = (res, { statusCode = 200, data = null, message = 'Success', meta } = {}) => {
  const body = { success: true, message, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
};

/**
 * Standard error response shape:
 * { success: false, message, errors? }
 */
const sendError = (res, { statusCode = 500, message = 'Something went wrong', errors } = {}) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

module.exports = { sendSuccess, sendError };
