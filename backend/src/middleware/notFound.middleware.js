// =============================================================
// src/middleware/notFound.middleware.js
// 404 para cualquier ruta no manejada.
// =============================================================

import { ApiError } from "../utils/ApiError.js";

export function notFound(req, _res, next) {
  next(ApiError.notFound(`Ruta no encontrada: ${req.method} ${req.originalUrl}`));
}
