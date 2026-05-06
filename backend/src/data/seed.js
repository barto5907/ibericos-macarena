// =============================================================
// src/data/seed.js
// Carga inicial de datos en la base de datos.
//
// Uso:
//   npm run prisma:seed             → modo seguro: solo crea lo que falta
//   npm run prisma:seed -- --force  → fuerza actualización de productos
//                                      desde seedProducts.js (cuidado: pisa
//                                      cambios manuales que hayas hecho)
// =============================================================

import "dotenv/config";
import { prisma, isPrismaReady, disconnectPrisma } from "../config/prisma.js";
import { seedProducts } from "./seedProducts.js";
import { seedReviews } from "./seedReviews.js";
import { logger } from "../utils/logger.js";

const FORCE = process.argv.includes("--force");

async function main() {
  if (!isPrismaReady()) {
    logger.error(
      "No hay DATABASE_URL configurada. Configura .env antes de hacer seed."
    );
    process.exit(1);
  }

  logger.info(
    `Modo: ${FORCE ? "FORCE (actualiza existentes)" : "seguro (solo crea nuevos)"}`
  );

  // -------------------------------------------------------------
  // Productos
  // -------------------------------------------------------------
  logger.info("Sembrando productos…");
  let created = 0;
  let updated = 0;
  let skipped = 0;
  for (const p of seedProducts) {
    const existing = await prisma.product.findUnique({
      where: { slug: p.slug },
    });
    if (existing) {
      if (FORCE) {
        await prisma.product.update({
          where: { slug: p.slug },
          data: p,
        });
        updated++;
      } else {
        skipped++;
      }
    } else {
      await prisma.product.create({ data: p });
      created++;
    }
  }
  logger.info(
    `✔ Productos: ${created} creados · ${updated} actualizados · ${skipped} sin cambios`
  );

  // -------------------------------------------------------------
  // Reseñas (idempotencia por nombre + comment)
  // Si seedReviews está vacío, no hace nada.
  // -------------------------------------------------------------
  if (seedReviews.length > 0) {
    logger.info("Sembrando reseñas…");
    let rCreated = 0;
    for (const r of seedReviews) {
      const exists = await prisma.review.findFirst({
        where: { name: r.name, comment: r.comment },
      });
      if (!exists) {
        await prisma.review.create({ data: r });
        rCreated++;
      }
    }
    logger.info(`✔ Reseñas: ${rCreated} creadas`);
  } else {
    logger.info("Reseñas: ninguna en seedReviews.js (intencional).");
  }

  logger.info("Seed completado ✅");
}

main()
  .catch((e) => {
    logger.error("Seed falló:", e);
    process.exit(1);
  })
  .finally(async () => {
    await disconnectPrisma();
  });
