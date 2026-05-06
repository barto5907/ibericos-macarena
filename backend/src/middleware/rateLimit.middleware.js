// =============================================================
// src/middleware/rateLimit.middleware.js
// Limitadores de tasa específicos por tipo de operación.
// =============================================================

import rateLimit from "express-rate-limit";
import { ApiError } from "../utils/ApiError.js";

const handler = (_req, _res, next) =>
  next(
    ApiError.tooMany(
      "Has hecho demasiadas peticiones. Inténtalo de nuevo en unos minutos."
    )
  );

const baseConfig = {
  standardHeaders: true,
  legacyHeaders: false,
  handler,
};

// -------------------------------------------------------------
// LOGIN: 5 intentos / 15 min por IP
// Bajamos de 10 a 5 — es un balance entre comodidad y brute-force.
// -------------------------------------------------------------
export const loginLimiter = rateLimit({
  ...baseConfig,
  windowMs: 15 * 60 * 1000,
  max: 5,
});

// -------------------------------------------------------------
// REGISTRO: 3 cuentas / hora por IP
// Limita la creación masiva de cuentas para spam de reseñas.
// -------------------------------------------------------------
export const registerLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 60 * 1000,
  max: 3,
});

// -------------------------------------------------------------
// CREAR RESEÑAS: 3 reseñas / hora por IP
// Aunque requiere auth, evitamos que una cuenta legítima haga spam.
// -------------------------------------------------------------
export const reviewLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 60 * 1000,
  max: 3,
});

// -------------------------------------------------------------
// API GENERAL (lectura): 120 req / min por IP
// Generoso para usuarios normales pero detiene scrapers agresivos.
// -------------------------------------------------------------
export const apiLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 1000,
  max: 120,
});
