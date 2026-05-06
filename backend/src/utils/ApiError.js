// =============================================================
// src/utils/ApiError.js
// Error con código HTTP, listo para el middleware de errores.
// =============================================================

export class ApiError extends Error {
  constructor(status, message, { code, details } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code || undefined;
    this.details = details || undefined;
    Error.captureStackTrace?.(this, ApiError);
  }

  static badRequest(msg = "Petición no válida", opts) {
    return new ApiError(400, msg, opts);
  }
  static unauthorized(msg = "No autorizado", opts) {
    return new ApiError(401, msg, opts);
  }
  static forbidden(msg = "Prohibido", opts) {
    return new ApiError(403, msg, opts);
  }
  static notFound(msg = "No encontrado", opts) {
    return new ApiError(404, msg, opts);
  }
  static conflict(msg = "Conflicto", opts) {
    return new ApiError(409, msg, opts);
  }
  static unprocessable(msg = "Datos no procesables", opts) {
    return new ApiError(422, msg, opts);
  }
  static tooMany(msg = "Demasiadas peticiones", opts) {
    return new ApiError(429, msg, opts);
  }
  static internal(msg = "Error interno", opts) {
    return new ApiError(500, msg, opts);
  }
}
