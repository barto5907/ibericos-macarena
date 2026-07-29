// =============================================================
// src/controllers/seo.controller.js
// Endpoints técnicos para SEO local: sitemap, robots y JSON-LD
// dinámico de LocalBusiness con AggregateRating real.
// =============================================================

import { listProducts } from "../services/products.service.js";
import { getRatingSummary } from "../services/reviews.service.js";
import {
  getOpeningHoursSpec,
  getBusinessStatus,
  getWeekSchedule,
  isSummerSeason,
} from "../utils/businessHours.js";

const BUSINESS = {
  name: "Ibéricos Macarena",
  alternateName: "Charcutería Ibéricos Macarena",
  description:
    "Charcutería especializada en productos ibéricos premium en Bollullos Par del Condado, Huelva. Jamón, paleta, lomo y embutidos artesanales.",
  url: "https://ibericosmacarena.com",
  telephone: "+34 616 778 900",
  email: "macarenapadillahiguera@gmail.com",
  address: {
    streetAddress: "Av. Constitución, 15",
    addressLocality: "Bollullos Par del Condado",
    addressRegion: "Huelva",
    postalCode: "21710",
    addressCountry: "ES",
  },
  geo: { latitude: 37.33956, longitude: -6.53744 },
  founder: "Macarena",
  foundingDate: "2024",
};

// GET /api/seo/local-business
// Devuelve el JSON-LD con AggregateRating REAL (basado en reseñas APPROVED).
export async function localBusiness(_req, res) {
  const summary = await getRatingSummary();

  const data = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "Store", "FoodEstablishment"],
    "@id": `${BUSINESS.url}/#localbusiness`,
    name: BUSINESS.name,
    alternateName: BUSINESS.alternateName,
    description: BUSINESS.description,
    url: `${BUSINESS.url}/`,
    telephone: BUSINESS.telephone,
    email: BUSINESS.email,
    priceRange: "€€",
    currenciesAccepted: "EUR",
    paymentAccepted: "Cash, Credit Card, Debit Card",
    foundingDate: BUSINESS.foundingDate,
    founder: { "@type": "Person", name: BUSINESS.founder },
    address: {
      "@type": "PostalAddress",
      ...BUSINESS.address,
    },
    geo: {
      "@type": "GeoCoordinates",
      ...BUSINESS.geo,
    },
    openingHoursSpecification: getOpeningHoursSpec(),
    areaServed: [
      { "@type": "City", name: "Bollullos Par del Condado" },
      { "@type": "AdministrativeArea", name: "Huelva" },
      { "@type": "AdministrativeArea", name: "Condado de Huelva" },
    ],
    hasMap:
      "https://www.google.com/maps?q=Av.+Constituci%C3%B3n+15+Bollullos+Par+del+Condado",
    ...(summary.count > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: summary.average,
        reviewCount: summary.count,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };

  res.set("Cache-Control", "public, max-age=900, stale-while-revalidate=1800");
  res.json(data);
}

// GET /sitemap.xml
export async function sitemap(_req, res) {
  const today = new Date().toISOString().split("T")[0];
  const products = await listProducts();

  const urls = [
    { loc: `${BUSINESS.url}/`, priority: "1.0", changefreq: "weekly" },
    // La galería sí se indexa: tiene contenido propio y las fotos
    // pueden posicionar en Google Imágenes gracias a los alt.
    { loc: `${BUSINESS.url}/galeria`, priority: "0.6", changefreq: "monthly" },
    // Las páginas legales (cookies, privacidad, aviso) NO se incluyen
    // porque tienen <meta name="robots" content="noindex"> — incluirlas
    // genera warnings en Search Console.
    ...products.map((p) => ({
      loc: `${BUSINESS.url}/productos/${p.slug}`,
      priority: "0.7",
      changefreq: "monthly",
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  res.set("Content-Type", "application/xml; charset=utf-8");
  res.set("Cache-Control", "public, max-age=3600");
  res.send(xml);
}

// GET /robots.txt
export function robots(_req, res) {
  const txt = `User-agent: *
Allow: /
Disallow: /api/auth/
Disallow: /api/reviews$

Sitemap: ${BUSINESS.url}/sitemap.xml
`;
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.set("Cache-Control", "public, max-age=86400");
  res.send(txt);
}
