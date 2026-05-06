// =============================================================
// src/routes/products.routes.js
// =============================================================

import { Router } from "express";
import { z } from "zod";

import {
  getProducts,
  getProduct,
} from "../controllers/products.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validate } from "../middleware/validate.middleware.js";

export const productsRouter = Router();

const listQuerySchema = z.object({
  category: z
    .enum(["jamon", "paleta", "embutido", "loncheado", "otros"])
    .optional(),
  featured: z.enum(["true", "false"]).optional(),
  search: z.string().trim().min(1).max(100).optional(),
});

const slugParamSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/i, "Slug no válido"),
});

// GET /api/products
productsRouter.get(
  "/",
  validate({ query: listQuerySchema }),
  asyncHandler(getProducts)
);

// GET /api/products/:slug
productsRouter.get(
  "/:slug",
  validate({ params: slugParamSchema }),
  asyncHandler(getProduct)
);
