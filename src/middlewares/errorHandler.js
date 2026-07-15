const { AppError } = require('../utils/errors');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue).join(', ');
    const message = `Duplicate value for field(s): [${field}]. Must be unique.`;
    error = new AppError(message, 409);
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new AppError(message, 400);
  }

  if (err.name === 'CastError') {
    const message = `Invalid ID format: ${err.value} for path ${err.path}`;
    error = new AppError(message, 400);
  }

  const statusCode = error.statusCode || 500;
  const status = error.status || 'error';

  if (process.env.NODE_ENV !== 'production' && statusCode === 500) {
    console.error('Unexpected Error:', err);
  }

  res.status(statusCode).json({
    status,
    message: error.message || 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
