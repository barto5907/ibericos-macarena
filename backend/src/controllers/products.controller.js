// =============================================================
// src/controllers/products.controller.js
// =============================================================

import {
  listProducts,
  getProductBySlug,
} from "../services/products.service.js";

// GET /api/products
export async function getProducts(req, res) {
  const { category, featured, search } = req.query;
  const items = await listProducts({
    category: category || undefined,
    featured: featured === "true" ? true : undefined,
    search: search || undefined,
  });

  // Cache en CDN/proxy: 5 min con stale-while-revalidate
  res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
  res.json({ products: items, total: items.length });
}

// GET /api/products/:slug
export async function getProduct(req, res) {
  const product = await getProductBySlug(req.params.slug);
  res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
  res.json({ product });
}
