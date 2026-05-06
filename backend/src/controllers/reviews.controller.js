// =============================================================
// src/controllers/reviews.controller.js
// =============================================================

import {
  listApprovedReviews,
  createReview,
  getRatingSummary,
} from "../services/reviews.service.js";

// GET /api/reviews
export async function getReviews(req, res) {
  const limit = Math.min(parseInt(req.query.limit, 10) || 12, 50);
  const [reviews, summary] = await Promise.all([
    listApprovedReviews({ limit }),
    getRatingSummary(),
  ]);

  // Caché en proxy/CDN: 10 min con stale-while-revalidate
  res.set("Cache-Control", "public, max-age=600, stale-while-revalidate=1200");
  res.json({
    reviews,
    summary, // { average, count } — útil para Schema.org AggregateRating
  });
}

// POST /api/reviews — requireAuth garantiza req.user
export async function postReview(req, res) {
  const { rating, comment } = req.body;
  // El nombre se toma del usuario autenticado para evitar suplantaciones.
  const name = req.user?.name || req.user?.email?.split("@")[0] || "Cliente";
  const review = await createReview({
    name,
    rating,
    comment,
    userId: req.user?.id,
  });
  res.status(201).json({
    review,
    message: "Gracias por tu reseña.",
  });
}
