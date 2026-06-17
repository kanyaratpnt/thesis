export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const payload = { message: err.message || "Server error" };
  if (err.code) payload.code = err.code;
  res.status(status).json(payload);
}
