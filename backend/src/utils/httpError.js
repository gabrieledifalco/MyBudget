export function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

/** Wrapper per controller async: inoltra gli errori a errorHandler. */
export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
