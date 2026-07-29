// Centralized error handler. Every controller now just throws
// or lets a rejected promise bubble up, and it lands here.
function errorHandler(err, req, res, next) {
  console.error('ERROR:', err.message);

  // Mongoose validation errors get a clean 400 instead of a raw 500
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  // Malformed MongoDB ObjectId (e.g. bad task id in the URL)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Server error',
  });
}

function notFound(req, res, next) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

module.exports = { errorHandler, notFound };