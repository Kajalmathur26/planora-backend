const handleError = (res, error, defaultMessage = 'Internal server error') => {
  console.error(error);
  const status = error.status || 500;
  const message = error.message || defaultMessage;
  res.status(status).json({ error: message });
};

module.exports = { handleError };
