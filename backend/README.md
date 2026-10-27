# Backend · Ibéricos Macarena

API en Node.js, Express, Prisma y PostgreSQL. Además de la API, **sirve el frontend completo** (HTML, CSS, JS e imágenes), así que en producción todo va bajo el mismo dominio y no hace falta CORS entre partes.

En producción: [ibericosmacarena.com](https://ibericosmacarena.com)

---

## Arrancar en local

```bash
cd backend
cp .env.example .env      # y ajusta los valores
npm install
npm run dev
```

Se abre en <http://localhost:4000>.

Si `DATABASE_URL` está vacía, el servidor arranca igualmente **en modo memoria** con datos de ejemplo. Es útil para probar sin base de datos, pero nada de lo que se cree persiste.

Para trabajar con PostgreSQL, rellena `DATABASE_URL` y ejecuta `npm run prisma:migrate` y después `npm run prisma:seed`.

---

## Variables de entorno

Plantilla en [`.env.example`](.env.example). El servidor las valida con Zod al arrancar y no inicia si alguna no es válida.

| Variable | Descripción | Por defecto |
|---|---|---|
| `NODE_ENV` | `development`, `test` o `production` | `development` |
| `PORT` | Puerto del servidor | `4000` |
| `FRONTEND_URL` | Orígenes permitidos, separados por comas | `http://localhost:5173` |
| `JWT_SECRET` | Clave para firmar las sesiones, mínimo 32 caracteres | solo de desarrollo |
| `JWT_EXPIRES_IN` | Duración de la sesión | `7d` |
| `COOKIE_NAME` | Nombre de la cookie de sesión | `im_token` |
| `COOKIE_SECURE` | `true` en producción (HTTPS) | `false` |
| `COOKIE_SAMESITE` | `lax`, `strict` o `none` | `lax` |
| `DATABASE_URL` | Cadena de conexión a PostgreSQL | vacía (modo memoria) |
| `LOG_LEVEL` | `debug`, `info`, `warn` o `error` | `info` |

En producción el servidor se niega a arrancar si `JWT_SECRET` conserva el valor de desarrollo. Una clave nueva se genera con:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

---

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor con recarga automática (nodemon) |
| `npm start` | Servidor sin recarga, el que se usa en producción |
| `npm run prisma:generate` | Regenera el cliente de Prisma tras tocar el esquema |
| `npm run prisma:migrate` | Crea y aplica una migración en local |
| `npm run prisma:deploy` | Aplica las migraciones existentes (producción) |
| `npm run prisma:studio` | Interfaz web para ver y editar la base de datos |
| `npm run prisma:seed` | Siembra los productos. Con `-- --force` actualiza los existentes |

---

## Estructura

```
backend/
├── server.js                  punto de entrada y timeouts anti-slowloris
├── .env.example               plantilla de variables de entorno
├── prisma/
│   ├── schema.prisma          modelos User, Product y Review
│   └── migrations/
└── src/
    ├── app.js                 Express, Helmet, CORS y servidor de estáticos
    ├── config/
    │   ├── env.js             validación de variables con Zod
    │   └── prisma.js          conexión y detección de si hay base de datos
    ├── routes/                auth, products, reviews, seo y business
    ├── controllers/           capa HTTP
    ├── services/              lógica de negocio, con respaldo en memoria
    ├── middleware/            auth, validate, rateLimit, error y notFound
    ├── utils/
    │   ├── jwt.js
    │   ├── businessHours.js   horarios de verano e invierno y estado actual
    │   ├── ApiError.js
    │   └── logger.js
    └── data/
        ├── seedProducts.js    21 productos en 8 categorías
        ├── seedReviews.js     vacío a propósito: solo se muestran reseñas reales
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

`/static/` se sirve con caché de 30 días en producción y acepta tanto `/static/...` como `/Static/...`, para evitar problemas de mayúsculas entre Windows y Linux.

### API

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/health` | no | Estado del servicio y de la base de datos |
| GET | `/api/products` | no | Catálogo (`?category=` `?featured=` `?search=`) |
| GET | `/api/products/:slug` | no | Detalle de un producto |
| GET | `/api/reviews` | no | Reseñas aprobadas, con media y total |
| POST | `/api/reviews` | sí | Crear reseña · 3 por hora y por IP |
| POST | `/api/auth/register` | no | Registro · 3 por hora y por IP |
| POST | `/api/auth/login` | no | Inicio de sesión · 5 cada 15 minutos por IP |
| POST | `/api/auth/logout` | no | Cerrar sesión |
| GET | `/api/auth/me` | sí | Usuario de la sesión actual |
| GET | `/api/business/status` | no | Abierto o cerrado, y horario de la semana |
| GET | `/api/seo/local-business` | no | JSON-LD con la valoración media real |
| GET | `/sitemap.xml` · `/robots.txt` | no | SEO |

---

## Modelos

**User:** id, name, email (único), password (bcrypt), role (`CUSTOMER`, `STAFF` o `ADMIN`) y createdAt.

**Product:** id, name, description, price, image, stock, slug (único), category, priceUnit, tag, featured, active, createdAt y updatedAt.

Categorías: `jamon`, `paleta`, `quesos`, `embutidos`, `loncheados`, `bacalao`, `conservas` y `otros`.

**Review:** id, name, rating (1 a 5), comment, status (`PENDING`, `APPROVED` o `REJECTED`) y createdAt.

---

## Horarios

Están en `src/utils/businessHours.js`, que es la **única fuente**. De ahí salen el indicador de «Abierto ahora / Cerrado» de la cabecera, la tabla de la sección de contacto y el `openingHoursSpecification` del JSON-LD que lee Google.

- **Verano** (1 de julio a 31 de agosto): de lunes a viernes, de 9:00 a 14:00.
- **Invierno** (resto del año): de lunes a viernes de 9:00 a 14:00 y de 18:00 a 20:00, y sábados de 9:00 a 14:00.
- Domingo cerrado siempre.

Los cálculos usan la zona horaria `Europe/Madrid` y no la del servidor, que en Render va en UTC.

---

## Seguridad

- Contraseñas con **bcrypt** (coste 12), con mínimo de 8 caracteres, una letra y un número.
- Sesión en **cookie httpOnly** con JWT, `SameSite=Lax` y `Secure` en producción.
- **Helmet** con política de contenido (CSP) estricta y HSTS de 6 meses en producción.
- **Límites de peticiones:** login 5 cada 15 minutos, registro 3 por hora, reseñas 3 por hora y API general 120 por minuto.
- **Validación con Zod** en todas las entradas. Rechaza objetos donde espera texto, así que no pasan cargas del tipo `{"$ne": null}`.
- El nombre de una reseña se toma **del usuario autenticado**, nunca del cuerpo de la petición, para que nadie firme en nombre de otro.
- En producción no se registran en el log las rutas `/api/auth/*`, para no dejar correos en los ficheros del servidor.
- Timeouts de conexión para evitar ataques de conexiones colgadas (slowloris).

---

## Modo memoria

Si no hay `DATABASE_URL`, o si una consulta a la base de datos falla, los servicios responden con los datos de `src/data/`, para que la web nunca se vea rota.

Un detalle a tener en cuenta: si la tabla `Product` está vacía, la web muestra los productos del archivo y todo *parece* funcionar, pero editar precios en la base de datos no cambia nada, porque nadie lee esa tabla. Para saber de dónde vienen los datos, mira el campo `id` en `/api/products`: una cadena larga aleatoria indica que vienen de la base de datos, y un valor igual al slug indica que vienen del archivo.

---

## Despliegue (Render)

| | |
|---|---|
| Root Directory | `backend` |
| Build Command | `npm install --include=dev && npx prisma generate && npx prisma migrate deploy` |
| Start Command | `npm start` |
| Health Check | `/api/health` |
| Región | Frankfurt, la misma que la base de datos |

`--include=dev` es necesario: con `NODE_ENV=production`, npm se saltaría las devDependencies y no encontraría la herramienta `prisma`.

En **Build Filters → Included Paths** hay que poner `**` para que también se despliegue cuando el cambio está fuera de `backend/`, por ejemplo al modificar el frontend.

Variables en producción: `NODE_ENV=production`, `COOKIE_SECURE=true`, un `JWT_SECRET` propio, `FRONTEND_URL` con el dominio y la URL de onrender.com separados por coma, y la `DATABASE_URL` **interna** de Render.
