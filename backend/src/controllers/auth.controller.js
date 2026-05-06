// =============================================================
// src/controllers/auth.controller.js
// Maneja la capa HTTP de autenticación.
// =============================================================

import {
  registerUser,
  loginUser,
  getUserById,
} from "../services/auth.service.js";
import { setAuthCookie, clearAuthCookie } from "../utils/jwt.js";
import { ApiError } from "../utils/ApiError.js";

// POST /api/auth/register
export async function register(req, res) {
  const { name, email, password } = req.body;
  const { user, token } = await registerUser({ name, email, password });
  setAuthCookie(res, token);
  res.status(201).json({ user, token });
}

// POST /api/auth/login
export async function login(req, res) {
  const { email, password } = req.body;
  const { user, token } = await loginUser({ email, password });
  setAuthCookie(res, token);
  res.json({ user, token });
}

// POST /api/auth/logout
export async function logout(_req, res) {
  clearAuthCookie(res);
  res.json({ ok: true });
}

// GET /api/auth/me  (requireAuth)
export async function me(req, res) {
  const user = await getUserById(req.user.id);
  if (!user) throw ApiError.notFound("Usuario no encontrado");
  res.json({ user });
}
