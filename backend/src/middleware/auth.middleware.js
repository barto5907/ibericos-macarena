// =============================================================
// src/middleware/auth.middleware.js
// Lee el JWT desde la cookie httpOnly o el header Authorization,
// lo verifica y rellena req.user.
// =============================================================

import { verifyToken } from "../utils/jwt.js";
import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";

function readToken(req) {
  // 1) Cookie httpOnly (recomendado para clientes web)
  const cookieToken = req.cookies?.[env.COOKIE_NAME];
  if (cookieToken) return cookieToken;

  // 2) Header Authorization: Bearer <token> (apps móviles, etc.)
  const auth = req.headers.authorization || "";
  if (auth.startsWith("Bearer ")) return auth.slice(7).trim();

  return null;
}

/**
 * Requiere autenticación. Devuelve 401 si no hay token o no es válido.
 */
export function requireAuth(req, _res, next) {
  const token = readToken(req);
  if (!token) return next(ApiError.unauthorized("Sesión no iniciada"));

  try {
    const payload = verifyToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
    next();
  } catch {
    next(ApiError.unauthorized("Token no válido o expirado"));
  }
}

/**
 * Si hay token válido, rellena req.user; si no, sigue como anónimo.
 */
export function optionalAuth(req, _res, next) {
  const token = readToken(req);
  if (!token) return next();
  try {
    const payload = verifyToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  } catch {
    /* token inválido — seguimos como anónimo */
  }
  next();
}

/**
 * Requiere uno de los roles indicados. Usar después de requireAuth.
 */
export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden("No tienes permisos para esta acción"));
    }
    next();
  };
}
