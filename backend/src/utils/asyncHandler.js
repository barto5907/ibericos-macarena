// =============================================================
// src/utils/asyncHandler.js
// Envuelve handlers async para reenviar errores a Express.
// =============================================================

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
