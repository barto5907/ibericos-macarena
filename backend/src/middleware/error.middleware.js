// =============================================================
// src/middleware/error.middleware.js
// Manejador central de errores. Convierte cualquier error en una
// respuesta JSON consistente y registra los inesperados.
// =============================================================

import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";
import { isProd } from "../config/env.js";

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  // ApiError → respuesta controlada
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      error: {
        message: err.message,
        code: err.code,
        details: err.details,
      },
    });
  }

  // Errores de Prisma
  if (err?.code && typeof err.code === "string" && err.code.startsWith("P")) {
    if (err.code === "P2002") {
      return res.status(409).json({
        error: {
          message: "Ya existe un registro con esos datos",
          code: "UNIQUE_CONSTRAINT",
          details: err.meta?.target,
        },
      });
    }
    if (err.code === "P2025") {
      return res.status(404).json({
        error: { message: "Registro no encontrado", code: err.code },
      });
    }
  }

  // CORS
  if (err?.message === "Origen no permitido por CORS") {
    return res.status(403).json({
      error: { message: err.message, code: "CORS_NOT_ALLOWED" },
    });
  }

  // Fallback: 500
  logger.error("Error no controlado:", err?.stack || err);
  res.status(500).json({
    error: {
      message: "Error interno del servidor",
      code: "INTERNAL_ERROR",
      ...(isProd ? {} : { stack: err?.stack, raw: String(err) }),
    },
  });
}
