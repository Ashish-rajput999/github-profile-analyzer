// src/middleware/errorHandler.js
// CENTRALIZED ERROR HANDLER MIDDLEWARE
//
// In Express, a middleware with EXACTLY 4 parameters (err, req, res, next)
// is treated as an "error-handling middleware". Express automatically routes
// any error passed to next(err) here.
//
// This means we only write error-response logic ONCE, here,
// instead of repeating it in every single controller.

/**
 * errorHandler
 * Catches all errors thrown or passed via next(err) from any route.
 *
 * @param {Error} err - The error object (may have a custom .statusCode property)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function (required for 4-param signature, even if unused)
 */
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  // Log the full error stack to the server console for debugging
  console.error('[ERROR]', err.stack || err.message);

  // Use the custom statusCode we attached (e.g., in githubService.js)
  // Fall back to 500 (Internal Server Error) if no custom code was set
  const statusCode = err.statusCode || 500;

  // Build the error response
  // For 404 (not found) and 429 (rate limit), we use the exact messages from the service
  // For all other errors (500s), we provide a generic message plus err.message for debugging
  if (statusCode === 404) {
    return res.status(404).json({
      success: false,
      message: err.message, // "GitHub user not found"
    });
  }

  if (statusCode === 429) {
    return res.status(429).json({
      success: false,
      message: err.message, // "GitHub API rate limit exceeded. Try again later."
    });
  }

  // Generic 500 handler for all other unknown errors
  return res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Internal server error' : err.message,
    error: err.message, // Include the raw error for developer debugging
  });
};

module.exports = errorHandler;
