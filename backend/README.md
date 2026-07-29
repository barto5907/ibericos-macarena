# Backend · Ibéricos Macarena

API en Node.js + Express + Prisma + PostgreSQL. Además de servir la API,
**sirve el frontend entero** (HTML, CSS, JS e imágenes), así que en producción
todo va bajo el mismo dominio y no hace falta CORS entre partes.

En producción: https://ibericosmacarena.com

---

## Arrancar en local

```powershell
cd D:\Documentos\ibericos-macarena\backend
cp .env.example .env      # y rellenar los valores
npm install
npm run dev
```

→ http://localhost:4000

Si `DATABASE_URL` está vacía, el servidor arranca igualmente **en modo memoria**
con datos simulados. Útil para probar sin base de datos, pero ojo: entonces
nada de lo que se cree persiste.

---

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor con recarga automática (nodemon) |
| `npm start` | Servidor sin recarga (es el que usa Render) |
| `npm run prisma:generate` | Regenera el cliente de Prisma tras tocar el schema |
| `npm run prisma:migrate` | Crea y aplica una migración en local |
| `npm run prisma:deploy` | Aplica migraciones existentes (producción) |
| `npm run prisma:studio` | Interfaz web para ver/editar la base de datos |
| `npm run prisma:seed` | Siembra productos · `-- --force` actualiza los existentes |

---

## Estructura

```
backend/
├── server.js                  punto de entrada · timeouts anti-slowloris
├── .env                       credenciales (NO se sube a Git)
├── .env.example               plantilla
├── prisma/
│   ├── schema.prisma          modelos User · Product · Review
│   └── migrations/
└── src/
    ├── app.js                 Express, Helmet, CORS, sirve el frontend
    ├── config/
    │   ├── env.js             validación de variables con Zod
    │   └── prisma.js          conexión y detección de si hay BD
    ├── routes/                auth · products · reviews · seo · business
    ├── controllers/           capa HTTP
    ├── services/              lógica de negocio (con respaldo en memoria)
    ├── middleware/            auth, validate, rateLimit, error, notFound
    ├── utils/
    │   ├── jwt.js
    │   ├── businessHours.js   ← horarios verano/invierno y estado actual
    │   ├── ApiError.js
    │   └── logger.js
    └── data/
        ├── seedProducts.js    21 productos, 8 categorías
        ├── seedReviews.js     vacío a propósito (solo reseñas reales)
        └── seed.js            script de siembra
```

---

## Endpoints

### Páginas

| Ruta | Sirve |
|---|---|
| `/` · `/inicio` | `HTML/index.html` |
| `/galeria` | `HTML/galeria.html` (indexable, está en el sitemap) |
| `/cookies` · `/privacidad` · `/aviso-legal` | páginas legales (con `noindex`) |
| `/Styles/*` · `/JS/*` · `/static/*` | archivos estáticos |

`/static/` se sirve con caché de 30 días en producción y acepta tanto
`/static/...` como `/Static/...`, para evitar problemas de mayúsculas
entre Windows y Linux.

### API

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/health` | — | Estado del servicio y de la base de datos |
| GET | `/api/products` | — | Catálogo (`?category=` `?featured=` `?search=`) |
| GET | `/api/products/:slug` | — | Detalle de un producto |
| GET | `/api/reviews` | — | Reseñas aprobadas + media y total |
| POST | `/api/reviews` | ✅ | Crear reseña · 3/hora por IP |
| POST | `/api/auth/register` | — | Registro · 3/hora por IP |
| POST | `/api/auth/login` | — | Login · 5 cada 15 min por IP |
| POST | `/api/auth/logout` | — | Cerrar sesión |
| GET | `/api/auth/me` | ✅ | Usuario de la sesión actual |
| GET | `/api/business/status` | — | Abierto/cerrado + horario de la semana |
| GET | `/api/seo/local-business` | — | JSON-LD con la valoración media real |
| GET | `/sitemap.xml` · `/robots.txt` | — | SEO |

---

## Modelos

**User** — id, name, email (único), password (bcrypt), role
(`CUSTOMER`/`STAFF`/`ADMIN`), createdAt

**Product** — id, name, description, price, image, stock, slug (único),
category, priceUnit, tag, featured, active, createdAt, updatedAt

Categorías: `jamon` · `paleta` · `quesos` · `embutidos` · `loncheados` ·
`bacalao` · `conservas` · `otros`

**Review** — id, name, rating (1-5), comment, status
(`PENDING`/`APPROVED`/`REJECTED`), createdAt

---

## Horarios

En `src/utils/businessHours.js`. Es la **única fuente**: de ahí salen la píldora
de "Abierto ahora / Cerrado" del header, la tabla de la sección de contacto y el
`openingHoursSpecification` del JSON-LD que lee Google.

- **Verano** (1 julio – 31 agosto): lunes a viernes, 9:00–14:00
- **Invierno** (resto del año): lunes a viernes 9:00–14:00 y 18:00–20:00 ·
  sábado 9:00–14:00
- Domingo cerrado siempre

Los cálculos usan la zona horaria `Europe/Madrid`, no la del servidor
(que en Render va en UTC).

---

## Seguridad

- Contraseñas con **bcrypt** (coste 12) · mínimo 8 caracteres, con letra y número
- Sesión en **cookie httpOnly** firmada con JWT · `SameSite=Lax` · `Secure` en producción
- **Helmet** con CSP estricta, HSTS de 6 meses, `frame-ancestors`, `form-action`,
  `object-src: none` y `upgrade-insecure-requests`
- **Límites de peticiones**: login 5/15 min · registro 3/hora · reseñas 3/hora ·
  API general 120/min
- **Validación con Zod** en todas las entradas (rechaza objetos donde espera
  texto, así que la inyección tipo `{"$ne":null}` no pasa)
- El nombre de una reseña se toma **del usuario autenticado**, nunca del cuerpo
  de la petición: no se puede firmar en nombre de otro
- En producción no se registran en el log las rutas `/api/auth/*`, para no dejar
  emails en los ficheros del servidor
- Timeouts para evitar conexiones colgadas (slowloris)

---

## Modo memoria

Si no hay `DATABASE_URL`, o si la consulta a la base de datos falla, los
servicios responden con los datos de `src/data/`. Sirve para que la web nunca
se vea rota.

⚠️ **Cuidado con esto:** si la tabla `Product` está vacía, la web muestra los
productos del archivo y todo *parece* funcionar. Pero entonces editar precios
en Prisma Studio no cambia nada, porque nadie lee esa tabla. Para saber de dónde
vienen, mirar el campo `id` en `/api/products`: si es una cadena larga aleatoria
viene de la base de datos; si coincide con el slug, viene del archivo.

---

## Despliegue (Render)

| | |
|---|---|
| Root Directory | `backend` |
| Build Command | `npm install --include=dev && npx prisma generate && npx prisma migrate deploy` |
| Start Command | `npm start` |
| Health Check | `/api/health` |
| Región | Frankfurt (la misma que la base de datos) |

El `--include=dev` es necesario: con `NODE_ENV=production`, npm se saltaría las
devDependencies y no encontraría la herramienta `prisma`.

En **Build Filters → Included Paths** está puesto `**` para que también
despliegue cuando el cambio esté fuera de `backend/` (es decir, cuando toco
el frontend).

Variables de entorno en producción: `NODE_ENV=production`, `COOKIE_SECURE=true`,
`JWT_SECRET` propio, `FRONTEND_URL` con el dominio **y** la URL de onrender.com
separados por coma, y la `DATABASE_URL` **interna**.

---

_Última actualización: julio de 2026_
