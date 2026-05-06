// =============================================================
// src/utils/jwt.js
// Firma/verificación de JWT y helpers para la cookie de sesión.
// =============================================================

import jwt from "jsonwebtoken";
import { env, isProd } from "../config/env.js";

/**
 * Firma un payload con el secret y la expiración configurados.
 */
export function signToken(payload, options = {}) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
    issuer: "ibericos-macarena",
    ...options,
  });
}

/**
 * Verifica un token y devuelve el payload, o lanza JsonWebTokenError.
 */
export function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET, { issuer: "ibericos-macarena" });
}

/**
 * Calcula el `maxAge` (en ms) a partir de JWT_EXPIRES_IN.
 * Acepta strings tipo "7d", "12h", "30m", "60s".
 */
function expiresInMs(value) {
  if (typeof value === "number") return value * 1000;
  const m = String(value).match(/^(\d+)([smhd])$/);
  if (!m) return 7 * 24 * 60 * 60 * 1000; // default 7d
  const n = parseInt(m[1], 10);
  const unit = m[2];
  const mult = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit];
  return n * mult;
}

/**
 * Opciones recomendadas para la cookie de sesión.
 * - httpOnly: protege ante XSS
 * - secure  : activado en producción (HTTPS)
 * - sameSite: lax por defecto (CSRF-friendly para mismo dominio)
 */
export function authCookieOptions() {
  return {
    httpOnly: true,
    secure: isProd ? true : env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAMESITE,
    maxAge: expiresInMs(env.JWT_EXPIRES_IN),
    path: "/",
  };
}

/**
 * Coloca el token JWT en la cookie httpOnly.
 */
export function setAuthCookie(res, token) {
  res.cookie(env.COOKIE_NAME, token, authCookieOptions());
}

/**
 * Limpia la cookie de sesión (logout).
 */
export function clearAuthCookie(res) {
  res.clearCookie(env.COOKIE_NAME, {
    httpOnly: true,
    secure: isProd ? true : env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAMESITE,
    path: "/",
  });
}
