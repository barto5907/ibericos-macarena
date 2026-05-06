// =============================================================
// src/services/reviews.service.js
// Reseñas públicas (sólo APPROVED) y creación moderada.
// Campo `comment` (no `text`).
// =============================================================

import { prisma, isPrismaReady } from "../config/prisma.js";
import { seedReviews } from "../data/seedReviews.js";

function format(r) {
  return {
    id: r.id ?? `seed_${r.name}_${(r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt) || ""}`,
    name: r.name,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt ?? new Date(),
  };
}

// Almacén en memoria para reseñas creadas vía API cuando no hay DB.
const memoryReviews = [];

/**
 * Lista reseñas APPROVED ordenadas por fecha desc.
 */
export async function listApprovedReviews({ limit = 12 } = {}) {
  if (isPrismaReady()) {
    try {
      const items = await prisma.review.findMany({
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        take: Math.min(limit, 50),
      });
      if (items.length > 0) return items.map(format);
    } catch {
      /* fallback */
    }
  }
  const items = [...memoryReviews, ...seedReviews]
    .filter((r) => r.status === "APPROVED")
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, limit);
  return items.map(format);
}

/**
 * Crear reseña. Por defecto APPROVED (configurable: cambia a PENDING para
 * moderar manualmente antes de publicar).
 */
export async function createReview({ name, rating, comment, userId, status = "APPROVED" }) {
  // userId se acepta pero no se persiste todavía (el schema actual no lo
  // contempla). Se mantiene en el contrato por si en el futuro añadimos la
  // relación Review.userId con una migración.
  const data = {
    name: name.trim(),
    rating,
    comment: comment.trim(),
    status,
  };

  if (isPrismaReady()) {
    try {
      const created = await prisma.review.create({ data });
      return format(created);
    } catch {
      /* fallback */
    }
  }

  const created = {
    id: `mem_review_${Date.now()}`,
    ...data,
    createdAt: new Date(),
  };
  memoryReviews.push(created);
  return format(created);
}

/**
 * Resumen de calificaciones (útil para Schema.org AggregateRating).
 */
export async function getRatingSummary() {
  if (isPrismaReady()) {
    try {
      const agg = await prisma.review.aggregate({
        where: { status: "APPROVED" },
        _avg: { rating: true },
        _count: { rating: true },
      });
      // BD respondió correctamente: usar SU resultado, aunque sea 0.
      return {
        average: Number((agg._avg.rating ?? 0).toFixed(2)),
        count: agg._count.rating,
      };
    } catch {
      /* fallback abajo */
    }
  }
  const list = [...memoryReviews, ...seedReviews].filter((r) => r.status === "APPROVED");
  const avg = list.reduce((s, r) => s + r.rating, 0) / (list.length || 1);
  return { average: Number(avg.toFixed(2)), count: list.length };
}
