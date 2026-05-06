// =============================================================
// src/routes/reviews.routes.js
// =============================================================

import { Router } from "express";
import { z } from "zod";

import {
  getReviews,
  postReview,
} from "../controllers/reviews.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validate } from "../middleware/validate.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { reviewLimiter } from "../middleware/rateLimit.middleware.js";

export const reviewsRouter = Router();

const listQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(50).optional(),
});

// El name lo cogemos del usuario autenticado, no del body.
const createReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z
    .string()
    .trim()
    .min(10, "Cuéntanos un poco más")
    .max(800, "El comentario es demasiado largo"),
});

// GET /api/reviews — público
reviewsRouter.get(
  "/",
  validate({ query: listQuerySchema }),
  asyncHandler(getReviews)
);

// POST /api/reviews — requiere sesión + 3 reseñas/hora máx
reviewsRouter.post(
  "/",
  requireAuth,
  reviewLimiter,
  validate({ body: createReviewSchema }),
  asyncHandler(postReview)
);
