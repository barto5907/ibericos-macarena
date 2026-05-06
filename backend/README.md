# Ibéricos Macarena · Proyecto completo

Web + API para Ibéricos Macarena, charcutería en **Bollullos Par del Condado, Huelva**.

- 🎨 **Frontend** estático: HTML / CSS / JS sin frameworks.
- ⚡ **Backend** Node.js + Express + Prisma + PostgreSQL.
- 🔐 Autenticación JWT en cookie httpOnly + bcrypt.
- 🌍 SEO local: JSON-LD con `AggregateRating` real, `sitemap.xml` y `robots.txt` dinámicos.
- 🧱 Listo para producción detrás de Nginx / Cloudflare / Render.

---

## 🚀 Arranque inmediato (sin base de datos)

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Abre **http://localhost:4000/** — el backend sirve el frontend en `Ibéricos Macarena/HTML/index.html` y la API en `/api/*`. Como `DATABASE_URL` está vacío, arranca en **modo memoria** con datos simulados.

---

## 📂 Estructura del proyecto

```
Ibéricos Macarena/
├── HTML/                  ← páginas
│   ├── index.html
│   └── cookies.html
├── Styles/                ← CSS
│   └── styles.css
├── JS/                    ← JavaScript del frontend
│   └── script.js
└── backend/               ← API + servidor estático
    ├── server.js          entry point
    ├── package.json
    ├── README.md          (este archivo)
    ├── .env.example       plantilla de variables
    ├── .gitignore
    ├── prisma/
    │   └── schema.prisma  modelos User · Product · Review
    └── src/
        ├── app.js         configuración Express
        ├── config/        env, prisma
        ├── routes/        auth, products, reviews, seo
        ├── controllers/   capa HTTP
        ├── services/      lógica de negocio (BD ↔ memoria)
        ├── middleware/    auth, validate, rate-limit, errores
        ├── utils/         JWT, ApiError, logger…
        └── data/          seedProducts, seedReviews, seed
```

---

## 🔌 Endpoints

| Método | Ruta                          | Auth      | Descripción |
| ------ | ----------------------------- | --------- | ----------- |
| GET    | `/`                           | —         | Frontend (index.html) |
| GET    | `/cookies`                    | —         | Política de cookies |
| GET    | `/sitemap.xml`                | —         | Sitemap dinámico (incluye productos) |
| GET    | `/robots.txt`                 | —         | Robots.txt |
| GET    | `/api/health`                 | —         | Estado del servicio |
| GET    | `/api/products`               | —         | Catálogo (`?category=`, `?featured=`, `?search=`) |
| GET    | `/api/products/:slug`         | —         | Detalle por slug |
| GET    | `/api/reviews`                | —         | Reseñas APPROVED + `summary{average,count}` |
| POST   | `/api/reviews`                | —         | Crear reseña |
| POST   | `/api/auth/register`          | —         | Registro · cookie httpOnly |
| POST   | `/api/auth/login`             | —         | Login · cookie httpOnly |
| POST   | `/api/auth/logout`            | —         | Cierra sesión |
| GET    | `/api/auth/me`                | requerida | Usuario autenticado |
| GET    | `/api/seo/local-business`     | —         | JSON-LD `LocalBusiness` con rating real |

---

## 🐘 Configuración con PostgreSQL (paso a paso)

### 1) Instalar PostgreSQL

**macOS** (con Homebrew):
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Ubuntu / Debian**:
```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable --now postgresql
```

**Windows**: descarga el instalador desde <https://www.postgresql.org/download/windows/>.

**Alternativa cero-instalación** — usa un servicio gratuito:
[Supabase](https://supabase.com), [Neon](https://neon.tech), [Render PostgreSQL](https://render.com/docs/databases) o [Railway](https://railway.app). Te dan una `DATABASE_URL` lista para pegar.

### 2) Crear usuario y base de datos

```bash
# Entrar al cliente de psql como superusuario
sudo -u postgres psql      # Linux
psql postgres              # macOS

# Dentro de psql:
CREATE USER macarena WITH PASSWORD 'cambia_esta_password';
CREATE DATABASE ibericos_macarena OWNER macarena;
GRANT ALL PRIVILEGES ON DATABASE ibericos_macarena TO macarena;
\q
```

### 3) Configurar `.env`

```env
DATABASE_URL=postgresql://macarena:cambia_esta_password@localhost:5432/ibericos_macarena?schema=public
JWT_SECRET=ejecuta_openssl_rand_hex_64_y_pega_aqui
NODE_ENV=development
```

### 4) Crear tablas y rellenar con datos iniciales

```bash
cd backend
npm install
npm run prisma:generate    # genera el cliente Prisma
npm run prisma:migrate     # crea tablas (te pedirá nombre de migración)
npm run prisma:seed        # productos + reseñas iniciales
npm run dev                # arranca el servidor
```

Visita **http://localhost:4000** — la web ya carga productos y reseñas desde la base de datos real.

### 5) Inspeccionar la BD (opcional)

```bash
npm run prisma:studio      # UI web en http://localhost:5555
```

---

## 🔐 Seguridad incluida

- **Helmet** con CSP estricta en producción.
- **CORS** con allowlist (`FRONTEND_URL`) y `credentials: true`.
- **bcrypt** (cost 12) para hashear contraseñas.
- **JWT** firmado con secret de 32+ caracteres, issuer fijo.
- Cookie de sesión **httpOnly** + `secure` en producción + `SameSite` configurable.
- **Rate-limiting**: 10 intentos/15 min en `/api/auth/*`, 120 req/min en el resto.
- **Zod** valida todos los inputs (body, query, params).
- Mensajes genéricos en login fallido (anti-enumeración de usuarios).
- `trust proxy` activado para funcionar tras Nginx / Cloudflare.

---

## 🌐 SEO local

- **JSON-LD `LocalBusiness`** estático en `index.html` (lo lee Google al instante) **y** dinámico en `/api/seo/local-business` (incluye `aggregateRating` calculado desde las reseñas reales).
- **Sitemap** dinámico (`/sitemap.xml`) que se actualiza solo cuando añades productos.
- **Robots.txt** con `Sitemap:` apuntando a tu dominio.
- Meta tags `geo.region`, `geo.position`, `ICBM`, Open Graph y Twitter Cards.
- Cabeceras `Cache-Control` con `stale-while-revalidate` en endpoints públicos.

---

## 🚢 Despliegue en producción

### Render / Railway (lo más rápido)

1. Crea servicio Node, apunta al directorio `backend`.
2. Build command: `npm install && npm run prisma:generate && npm run prisma:deploy`
3. Start command: `npm start`
4. Variables de entorno:
   - `NODE_ENV=production`
   - `JWT_SECRET=<openssl rand -hex 64>`
   - `DATABASE_URL=<la que te dan>`
   - `COOKIE_SECURE=true`
   - `FRONTEND_URL=https://tu-dominio.es`
5. Conecta el dominio.

### VPS propio (Nginx + PM2)

```bash
# En el servidor
git clone <repo>
cd "Ibéricos Macarena/backend"
cp .env.example .env  # edita con valores de producción
npm ci
npm run prisma:generate
npm run prisma:deploy
npm i -g pm2
pm2 start server.js --name ibericos-api
pm2 save && pm2 startup
```

Nginx delante con proxy_pass al puerto 4000 y certificado SSL (Let's Encrypt). El backend ya sirve el frontend, no necesitas servirlo aparte.

### Checklist final

- [ ] `JWT_SECRET` aleatorio y largo (no dejar el de dev)
- [ ] `DATABASE_URL` apuntando al PostgreSQL de producción
- [ ] `COOKIE_SECURE=true` (HTTPS obligatorio)
- [ ] `FRONTEND_URL` con tu dominio
- [ ] `npm run prisma:deploy` ejecutado al menos una vez
- [ ] Dominio apuntando al servidor (registros A/AAAA o CNAME a Render/Railway)
- [ ] Sustituir teléfono y email reales en `index.html` (ya están: +34 616 778 900 e ibericosmacarena@gmail.com)
- [ ] Subir el sitemap a Google Search Console: `https://tu-dominio.es/sitemap.xml`

---

## 🧪 Pruebas rápidas con curl

```bash
# Frontend
curl -I http://localhost:4000/
curl http://localhost:4000/sitemap.xml | head

# API
curl http://localhost:4000/api/health
curl http://localhost:4000/api/products
curl http://localhost:4000/api/reviews
curl http://localhost:4000/api/seo/local-business

# Auth (cookie persistente)
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Macarena","email":"macarena@test.com","password":"superSegura2024"}' \
  -c /tmp/cookies.txt

curl http://localhost:4000/api/auth/me -b /tmp/cookies.txt
```

---

## 📦 Scripts disponibles

| Script                    | Para qué sirve                                |
| ------------------------- | --------------------------------------------- |
| `npm start`               | Arranque normal (producción).                 |
| `npm run dev`             | Desarrollo con auto-reload (nodemon).         |
| `npm run prisma:generate` | Genera el cliente Prisma.                     |
| `npm run prisma:migrate`  | Crea/aplica migración (dev).                  |
| `npm run prisma:deploy`   | Aplica migraciones (producción).              |
| `npm run prisma:studio`   | UI web para ver/editar la BD.                 |
| `npm run prisma:seed`     | Inserta productos y reseñas iniciales.        |

---

## ❓ Preguntas frecuentes

**¿Por qué arranca aunque no haya base de datos?**
Para que puedas probar la web al instante. Los servicios detectan si Prisma está disponible y, si no, usan datos en memoria del seed. Cuando configuras `DATABASE_URL`, todo pasa a usar PostgreSQL automáticamente.

**¿Dónde cambio el teléfono o el email?**
En `HTML/index.html` (header, contacto, footer y JSON-LD) y en `backend/src/controllers/seo.controller.js` (objeto `BUSINESS`).

**¿Cómo añado productos nuevos?**
Edita `backend/src/data/seedProducts.js` y vuelve a hacer `npm run prisma:seed`. O simplemente créalos desde Prisma Studio (`npm run prisma:studio`).

**¿Las reseñas se moderan?**
El service `createReview` recibe estado `APPROVED` por defecto para que la web no quede vacía si algún cliente la usa. Si quieres moderarlas antes de publicar, en `reviews.service.js` cambia el default a `"PENDING"`. Solo aparecen las APPROVED.
