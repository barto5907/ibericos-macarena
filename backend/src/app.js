// =============================================================
// src/app.js · configuración de Express
// - API REST en /api
// - SEO técnico en raíz (/sitemap.xml, /robots.txt)
// - Frontend estático servido desde el mismo dominio
// =============================================================

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

import { env, isProd } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { router as apiRouter } from "./routes/index.js";
import { sitemap, robots } from "./controllers/seo.controller.js";
import { notFound } from "./middleware/notFound.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// El frontend está en el directorio padre del backend
// (Ibéricos Macarena/backend/src/app.js → Ibéricos Macarena/)
const FRONTEND_ROOT = path.resolve(__dirname, "..", "..");
const HTML_DIR = path.join(FRONTEND_ROOT, "HTML");
const STYLES_DIR = path.join(FRONTEND_ROOT, "Styles");
const JS_DIR = path.join(FRONTEND_ROOT, "JS");
// `static/` (minúsculas, convención web) o `Static/` si en Windows ya existe.
// Probamos primero la versión en minúsculas; si no, caemos a la mayúscula.
const STATIC_DIR_LOWER = path.join(FRONTEND_ROOT, "static");
const STATIC_DIR_UPPER = path.join(FRONTEND_ROOT, "Static");
const STATIC_DIR = fs.existsSync(STATIC_DIR_LOWER)
  ? STATIC_DIR_LOWER
  : STATIC_DIR_UPPER;

export const app = express();

// -------------------------------------------------------------
// Confianza en proxy (Nginx, Cloudflare, Render, Heroku…)
// -------------------------------------------------------------
app.set("trust proxy", 1);

// -------------------------------------------------------------
// Cabeceras de seguridad (helmet)
// -------------------------------------------------------------
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: isProd
      ? {
          useDefaults: true,
          directives: {
            "default-src": ["'self'"],
            "script-src": ["'self'", "'unsafe-inline'"],
            "style-src": [
              "'self'",
              "'unsafe-inline'",
              "https://fonts.googleapis.com",
            ],
            "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
            "img-src": ["'self'", "data:", "https:"],
            "frame-src": ["'self'", "https://www.google.com"],
            "connect-src": ["'self'"],
            // Anti-clickjacking: nadie puede embeber esta web en un iframe
            "frame-ancestors": ["'self'"],
            // Solo se pueden enviar formularios al propio dominio
            "form-action": ["'self'"],
            // Sin plugins (Flash, etc.)
            "object-src": ["'none'"],
            // Forzar HTTPS para todos los recursos en producción
            "upgrade-insecure-requests": [],
          },
        }
      : false,
    // Strict-Transport-Security: 6 meses, forzar HTTPS en todos los subdominios
    strictTransportSecurity: isProd
      ? { maxAge: 15_552_000, includeSubDomains: true, preload: false }
      : false,
    // Anti-MIME-sniffing
    noSniff: true,
    // Anti-clickjacking (también vía X-Frame-Options para navegadores antiguos)
    frameguard: { action: "sameorigin" },
    // Limita info en el referer enviado a otros dominios
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  })
);

// -------------------------------------------------------------
// CORS · acepta el frontend con credenciales (cookies)
// -------------------------------------------------------------
const allowedOrigins = env.FRONTEND_URL.split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true); // curl, healthchecks
      if (allowedOrigins.includes(origin)) return cb(null, true);
      logger.warn(`CORS bloqueado para origen: ${origin}`);
      return cb(new Error("Origen no permitido por CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  })
);

// -------------------------------------------------------------
// Body parsers, cookies, compresión, logs
// -------------------------------------------------------------
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
app.use(compression());

if (!isProd) {
  app.use(morgan("dev"));
} else {
  app.use(
    morgan("combined", {
      stream: { write: (msg) => logger.info(msg.trim()) },
      // No loguear /api/auth/* para evitar registrar emails en logs de servidor
      skip: (req) => req.path.startsWith("/api/auth/"),
    })
  );
}

// -------------------------------------------------------------
// SEO TÉCNICO · sitemap + robots a la raíz
// -------------------------------------------------------------
app.get("/sitemap.xml", sitemap);
app.get("/robots.txt", robots);

// -------------------------------------------------------------
// API REST · prioritaria sobre cualquier ruta de archivo
// -------------------------------------------------------------
app.use("/api", apiRouter);

// =============================================================
// FRONTEND · estrategia robusta
// =============================================================
// Sirve los recursos estáticos así (con las URLs que el HTML pide):
//   /Styles/styles.css      → ../Styles/styles.css
//   /JS/script.js           → ../JS/script.js
//   /HTML/index.html        → acceso directo a la carpeta
//   /index.html, /          → root del frontend (handler abajo)
//   /cookies.html, /cookies → cualquier .html en HTML/ se resuelve
// =============================================================

const staticOpts = {
  maxAge: isProd ? "1d" : 0,
  etag: true,
  lastModified: true,
};

// Caché más larga para imágenes/assets (rara vez cambian, ahorra ancho de banda)
const assetOpts = {
  maxAge: isProd ? "30d" : 0,
  etag: true,
  lastModified: true,
  immutable: isProd,
};

if (fs.existsSync(STYLES_DIR))
  app.use("/Styles", express.static(STYLES_DIR, staticOpts));
if (fs.existsSync(JS_DIR)) app.use("/JS", express.static(JS_DIR, staticOpts));
if (fs.existsSync(HTML_DIR))
  app.use("/HTML", express.static(HTML_DIR, staticOpts));

// Carpeta `static/` (imágenes, fotos, assets).
// Aceptamos tanto /static/... como /Static/... como /STATIC/... para evitar
// roturas por casing entre Windows (case-insensitive) y Linux (case-sensitive).
if (fs.existsSync(STATIC_DIR)) {
  app.use("/static", express.static(STATIC_DIR, assetOpts));
  app.use("/Static", express.static(STATIC_DIR, assetOpts));
}

// Página de inicio
app.get(["/", "/inicio"], (_req, res, next) => {
  const file = path.join(HTML_DIR, "index.html");
  if (!fs.existsSync(file)) return next();
  res.sendFile(file);
});

// Aliases legibles para SEO (URLs sin .html)
app.get("/politica-cookies", (_req, res, next) => {
  const file = path.join(HTML_DIR, "cookies.html");
  if (!fs.existsSync(file)) return next();
  res.sendFile(file);
});

// -------------------------------------------------------------
// Resolver genérico: cualquier archivo .html (con o sin extensión)
// se busca en HTML/. Esto cubre:
//   /index.html, /cookies.html, /faq.html, /productos.html…
//   /cookies, /faq, /productos…
// Y previene 404 cuando se añadan páginas nuevas en HTML/.
// -------------------------------------------------------------
app.get(/^\/([a-zA-Z0-9_-]+)(\.html)?$/, (req, res, next) => {
  const name = req.params[0];
  // Lista de prefijos que NO son páginas — dejarlos pasar al 404.
  const reserved = ["api", "Styles", "JS", "HTML", "sitemap.xml", "robots.txt"];
  if (reserved.includes(name)) return next();

  const candidate = path.join(HTML_DIR, `${name}.html`);
  // Verificación de seguridad: el path resuelto debe estar dentro de HTML/
  const resolved = path.resolve(candidate);
  if (!resolved.startsWith(path.resolve(HTML_DIR))) return next();
  if (!fs.existsSync(resolved)) return next();

  res.sendFile(resolved);
});

// -------------------------------------------------------------
// 404 + manejador central de errores (siempre al final)
// -------------------------------------------------------------
app.use(notFound);
app.use(errorHandler);

// -------------------------------------------------------------
// Información de arranque
// -------------------------------------------------------------
logger.info(`Frontend root: ${FRONTEND_ROOT}`);
logger.info(`  · HTML:   ${fs.existsSync(HTML_DIR) ? "✓" : "✗"} ${HTML_DIR}`);
logger.info(`  · Styles: ${fs.existsSync(STYLES_DIR) ? "✓" : "✗"} ${STYLES_DIR}`);
logger.info(`  · JS:     ${fs.existsSync(JS_DIR) ? "✓" : "✗"} ${JS_DIR}`);

if (fs.existsSync(HTML_DIR)) {
  const htmlFiles = fs.readdirSync(HTML_DIR).filter((f) => f.endsWith(".html"));
  logger.info(`  · Páginas detectadas: ${htmlFiles.join(", ")}`);
}
