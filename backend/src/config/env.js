// =============================================================
// src/config/env.js
// Lectura y validación de variables de entorno.
// =============================================================

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  FRONTEND_URL: z.string().min(1).default("http://localhost:5173"),

  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET debe tener al menos 32 caracteres")
    .default("dev_secret_change_me_dev_secret_change_me_dev_secret"),
  JWT_EXPIRES_IN: z.string().default("7d"),

  COOKIE_NAME: z.string().default("im_token"),
  COOKIE_SECURE: z
    .union([z.boolean(), z.string()])
    .default(false)
    .transform((v) => v === true || v === "true"),
  COOKIE_SAMESITE: z.enum(["lax", "strict", "none"]).default("lax"),

  DATABASE_URL: z.string().optional().default(""),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("❌ Variables de entorno no válidas:");
  // eslint-disable-next-line no-console
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";
export const isDev = env.NODE_ENV === "development";
export const isTest = env.NODE_ENV === "test";

// Aviso fuerte si en producción se usa el secret por defecto
if (isProd && env.JWT_SECRET.startsWith("dev_secret_")) {
  // eslint-disable-next-line no-console
  console.error(
    "🚨  JWT_SECRET por defecto en producción · cambia el valor antes de desplegar"
  );
  process.exit(1);
}
