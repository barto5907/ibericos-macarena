// =============================================================
// src/routes/seo.routes.js
// Endpoints técnicos de SEO local.
// =============================================================

import { Router } from "express";
import { localBusiness } from "../controllers/seo.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const seoRouter = Router();

// GET /api/seo/local-business → JSON-LD dinámico
seoRouter.get("/local-business", asyncHandler(localBusiness));
