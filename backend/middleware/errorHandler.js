export const errorHandler = (err, req, res, next) => {
  console.error('[ProjectXia Error Tracker]:', err.stack || err.message);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Security Exception';

  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found in ProjectXia Vault';
  }

  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field entered: A resource or user with this unique identifier already exists';
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map(val => val.message)
      .join(', ');
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    shieldAuditCode: `XIA-ERR-${Date.now().toString(36).toUpperCase()}`,
  });
};
