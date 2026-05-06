// =============================================================
// src/config/prisma.js
// Singleton del cliente Prisma.
// Si no hay DATABASE_URL configurada, exportamos null para que
// los servicios usen el fallback en memoria de forma transparente.
// =============================================================

import { env, isDev } from "./env.js";
import { logger } from "../utils/logger.js";

let prisma = null;

if (env.DATABASE_URL && env.DATABASE_URL.length > 0) {
  try {
    // Import dinámico: evita el error si @prisma/client no está
    // generado todavía (npx prisma generate). En ese caso caeremos
    // al modo memoria silenciosamente.
    const { PrismaClient } = await import("@prisma/client");

    const globalForPrisma = globalThis;

    prisma =
      globalForPrisma.__prisma ??
      new PrismaClient({
        log: isDev ? ["warn", "error"] : ["error"],
      });

    if (isDev) globalForPrisma.__prisma = prisma;

    logger.info("Prisma · cliente inicializado");
  } catch (err) {
    logger.warn(
      "Prisma · @prisma/client no disponible · usando memoria",
      err.message
    );
    prisma = null;
  }
} else {
  logger.info("Prisma · sin DATABASE_URL · backend en modo memoria");
}

export { prisma };

export function isPrismaReady() {
  return prisma !== null;
}

export async function disconnectPrisma() {
  if (prisma) {
    await prisma.$disconnect();
  }
}
