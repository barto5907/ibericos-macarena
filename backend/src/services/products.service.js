// =============================================================
// src/services/products.service.js
// Listado y detalle de productos.
// Funciona con Prisma (PostgreSQL) o con datos en memoria.
// =============================================================

import { prisma, isPrismaReady } from "../config/prisma.js";
import { seedProducts } from "../data/seedProducts.js";
import { ApiError } from "../utils/ApiError.js";

// Forma de salida pública (siempre la misma, venga de DB o memoria).
function format(p) {
  return {
    id: p.id ?? p.slug,
    slug: p.slug,
    name: p.name,
    description: p.description,
    category: p.category ?? "otros",
    price: typeof p.price === "object" ? Number(p.price) : Number(p.price),
    priceUnit: p.priceUnit ?? "kg",
    image: p.image ?? null,
    tag: p.tag ?? null,
    featured: !!p.featured,
    stock: typeof p.stock === "number" ? p.stock : 0,
    active: p.active !== false,
  };
}

/**
 * Listar productos.
 * @param {{ category?: string, featured?: boolean, search?: string }} opts
 */
export async function listProducts(opts = {}) {
  const { category, featured, search } = opts;

  if (isPrismaReady()) {
    try {
      const where = { active: true };
      if (category) where.category = category;
      if (featured === true) where.featured = true;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }
      const items = await prisma.product.findMany({
        where,
        orderBy: [{ featured: "desc" }, { name: "asc" }],
      });
      if (items.length > 0) return items.map(format);
      // Si la tabla está vacía, caemos al seed para que la web no aparezca vacía.
    } catch {
      /* fallback abajo */
    }
  }

  let items = seedProducts.filter((p) => p.active !== false);
  if (category) items = items.filter((p) => p.category === category);
  if (featured === true) items = items.filter((p) => p.featured);
  if (search) {
    const q = search.toLowerCase();
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }
  return items.map(format);
}

/**
 * Detalle por slug.
 */
export async function getProductBySlug(slug) {
  if (isPrismaReady()) {
    try {
      const p = await prisma.product.findUnique({ where: { slug } });
      if (p) return format(p);
    } catch {
      /* fallback */
    }
  }
  const p = seedProducts.find((x) => x.slug === slug);
  if (!p) throw ApiError.notFound("Producto no encontrado");
  return format(p);
}
