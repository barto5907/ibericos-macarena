// =============================================================
// src/routes/index.js
// Router principal: monta todos los módulos bajo /api.
// =============================================================

import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { productsRouter } from "./products.routes.js";
import { reviewsRouter } from "./reviews.routes.js";
import { seoRouter } from "./seo.routes.js";
import { apiLimiter } from "../middleware/rateLimit.middleware.js";
import { isPrismaReady } from "../config/prisma.js";

export const router = Router();

// Healthcheck (sin rate-limit, sin caché)
router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "ibericos-macarena-api",
    db: isPrismaReady() ? "prisma" : "memory",
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Limit global ligero al resto de la API
router.use(apiLimiter);

router.use("/auth", authRouter);
router.use("/products", productsRouter);
router.use("/reviews", reviewsRouter);
router.use("/seo", seoRouter);
