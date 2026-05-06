// =============================================================
// src/routes/auth.routes.js
// =============================================================

import { Router } from "express";
import { z } from "zod";

import { register, login, logout, me } from "../controllers/auth.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validate } from "../middleware/validate.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  loginLimiter,
  registerLimiter,
} from "../middleware/rateLimit.middleware.js";

export const authRouter = Router();

// -------------------------------------------------------------
// Schemas con validación reforzada
// -------------------------------------------------------------
const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(128, "La contraseña es demasiado larga")
  .refine((p) => /[a-zA-Z]/.test(p), {
    message: "La contraseña debe incluir al menos una letra",
  })
  .refine((p) => /[0-9]/.test(p), {
    message: "La contraseña debe incluir al menos un número",
  });

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(80, "El nombre es demasiado largo")
    .regex(/^[\p{L}\p{M}\s'\-.]+$/u, "El nombre contiene caracteres no permitidos"),
  email: z.string().trim().toLowerCase().email("Email no válido").max(254),
  password: passwordSchema,
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email no válido").max(254),
  password: z.string().min(1, "Contraseña requerida").max(128),
});

// -------------------------------------------------------------
// Rutas
// -------------------------------------------------------------

// POST /api/auth/register · 3 cuentas / hora por IP
authRouter.post(
  "/register",
  registerLimiter,
  validate({ body: registerSchema }),
  asyncHandler(register)
);

// POST /api/auth/login · 5 intentos / 15 min por IP
authRouter.post(
  "/login",
  loginLimiter,
  validate({ body: loginSchema }),
  asyncHandler(login)
);

// POST /api/auth/logout
authRouter.post("/logout", asyncHandler(logout));

// GET /api/auth/me
authRouter.get("/me", requireAuth, asyncHandler(me));
