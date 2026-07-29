// Wraps an async route handler so any thrown/rejected error is
// automatically passed to Express's error-handling middleware,
// instead of every controller needing its own try/catch.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;