// =============================================================
// IBÉRICOS MACARENA · server.js
// Punto de entrada · arranca la app y gestiona el ciclo de vida
// =============================================================

import "dotenv/config";
import { app } from "./src/app.js";
import { env } from "./src/config/env.js";
import { logger } from "./src/utils/logger.js";
import { disconnectPrisma, isPrismaReady } from "./src/config/prisma.js";

const server = app.listen(env.PORT, () => {
  const dbStatus = isPrismaReady()
    ? "PostgreSQL (Prisma)"
    : "memoria (sin DATABASE_URL)";
  logger.info("─".repeat(60));
  logger.info(`🐷  Ibéricos Macarena · API`);
  logger.info(`    Entorno   : ${env.NODE_ENV}`);
  logger.info(`    Puerto    : ${env.PORT}`);
  logger.info(`    Frontend  : ${env.FRONTEND_URL}`);
  logger.info(`    Base datos: ${dbStatus}`);
  logger.info(`    Salud     : http://localhost:${env.PORT}/api/health`);
  logger.info("─".repeat(60));
});

// -------------------------------------------------------------
// Timeouts contra slowloris y conexiones colgadas
// -------------------------------------------------------------
server.headersTimeout = 60_000;        // tiempo máx. para recibir headers (60s)
server.requestTimeout = 60_000;        // tiempo máx. de toda la petición
server.keepAliveTimeout = 65_000;      // mayor que el del balanceador típico
server.timeout = 120_000;              // socket idle timeout

// -------------------------------------------------------------
// Cierre limpio (SIGINT, SIGTERM, errores fatales)
// -------------------------------------------------------------
async function shutdown(signal) {
  logger.warn(`Señal ${signal} recibida · cerrando servidor…`);

  server.close(async () => {
    try {
      await disconnectPrisma();
      logger.info("Prisma desconectado · servidor cerrado correctamente");
      process.exit(0);
    } catch (err) {
      logger.error("Error al cerrar Prisma", err);
      process.exit(1);
    }
  });

  // Forzar cierre si tarda demasiado
  setTimeout(() => {
    logger.error("Cierre forzado tras 10s");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled rejection", reason);
});
process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception", err);
  shutdown("uncaughtException");
});
