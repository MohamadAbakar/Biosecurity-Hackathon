const logger = require('../utils/logger');

/**
 * Central Express error handler.
 * app.js registers this as: app.use(errorHandler)
 * It handles both operational errors and 404s (when no route matched).
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;

  if (statusCode >= 500) {
    logger.error(err.message, { stack: err.stack, url: req.originalUrl });
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
