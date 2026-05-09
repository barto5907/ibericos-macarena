# Ibéricos Macarena · Web del negocio

Charcutería gourmet en Bollullos Par del Condado, Huelva.
Web informativa con catálogo, reseñas de clientes y datos de contacto.

> Este README está pensado como **mi propia chuleta**: comandos del día a día, dónde está cada cosa, qué hacer cuando algo falla. No es documentación pública.

---

## Stack

- **Frontend**: HTML + CSS + JS (sin frameworks)
- **Backend**: Node.js + Express + Prisma
- **Base de datos**: PostgreSQL (local en desarrollo · Render en producción)
- **Autenticación**: JWT en cookie httpOnly + bcrypt
- **Hosting previsto**: Render
- **Dominio**: `ibericosmacarena.com` (Cloudflare Registrar)
- **Repo privado**: <https://github.com/barto5907/ibericos-macarena>

---

## Estructura del proyecto

```
ibericos-macarena/
├── HTML/                 ← Páginas (index, cookies, privacidad, aviso-legal)
├── Styles/               ← styles.css (un solo archivo)
├── JS/                   ← script.js (un solo archivo)
├── static/               ← Imágenes y assets
│   ├── products/         ← Fotos de productos
│   └── tienda/           ← Fotos del local, Macarena, etc.
├── backend/
│   ├── server.js         ← Punto de entrada
│   ├── package.json
│   ├── .env              ← ⚠️ NO subir a Git (credenciales)
│   ├── .env.example      ← Plantilla
│   ├── prisma/
│   │   ├── schema.prisma ← Modelo de la BD
│   │   └── migrations/
│   └── src/
│       ├── app.js              ← Express, helmet, CORS
│       ├── config/             ← Env y conexión a Prisma
│       ├── routes/             ← Rutas de la API
│       ├── controllers/        ← Lógica de cada endpoint
│       ├── services/           ← Lógica de negocio
│       ├── middleware/         ← Auth, validaciones, rate-limits
│       ├── utils/              ← Helpers (jwt, businessHours, logger…)
│       └── data/               ← Seeds (productos, reseñas)
├── .gitignore
└── README.md             ← Este archivo
```

---

## Comandos del día a día

> Todos se ejecutan desde `D:\Documentos\ibericos-macarena\backend` salvo que se diga lo contrario.

### Antes de cada sesión (PowerShell)

Como la `DATABASE_URL` no se guarda automáticamente, hay que setearla cada vez que abres una terminal nueva:

```powershell
$env:DATABASE_URL="postgresql://Bartolome:Blarto0509@localhost:5432/ibericos_macarena?schema=public"
```

> Si en el futuro renombro la carpeta padre a algo sin tildes ni espacios, esto deja de ser necesario y `.env` se carga solo.

### Arrancar el servidor (modo desarrollo)

```powershell
npm.cmd run dev
```

- Se reinicia automáticamente cuando edito archivos (gracias a nodemon)
- Logs detallados de cada petición
- Sirve la web entera en <http://localhost:4000>
- Para parar: `Ctrl+C`

### Arrancar el servidor (modo producción/preview)

```powershell
npm.cmd start
```

- Sin auto-recarga, más eficiente
- Útil para probar cómo se va a comportar en el servidor real
- En el día a día uso `dev`, no `start`

### Ver y editar la base de datos visualmente

En **otra terminal** (no donde corre el servidor):

```powershell
$env:DATABASE_URL="postgresql://Bartolome:Blarto0509@localhost:5432/ibericos_macarena?schema=public"
npm.cmd run prisma:studio
```

Se abre `http://localhost:5555` con UI tipo hoja de cálculo. Aquí puedo:

- Ver todos los productos
- Cambiar precios, descripciones, fotos
- Ver reseñas y borrar las que no me gusten
- Ver los usuarios registrados

### Sembrar datos iniciales en la BD

Solo si la BD está vacía o si he añadido productos nuevos a `seedProducts.js`:

```powershell
npm.cmd run prisma:seed
```

- **Modo seguro** (default): solo crea productos que no existen, no toca los que ya están
- **Modo agresivo**: `npm.cmd run prisma:seed -- --force` actualiza todo desde el archivo (ojo, pisa cambios manuales)

### Migraciones de BD

Solo si he cambiado `schema.prisma` (ej: añadido un campo nuevo a una tabla):

```powershell
npm.cmd run prisma:migrate
```

Te pide un nombre, pones algo descriptivo (`add_email_verified`, `new_category_field`, etc.).

### Generar el cliente de Prisma

Si Prisma se queja de "Cannot find module @prisma/client" o si he cambiado el schema:

```powershell
npm.cmd run prisma:generate
```

---

## Trabajar con Git

### Antes de cualquier commit

```powershell
cd D:\Documentos\ibericos-macarena
git status              # ver qué cambió
git diff                # ver qué cambió exactamente
```

### Guardar cambios y subir a GitHub

```powershell
git add .
git commit -m "Descripción breve de qué cambié"
git push
```

### Ejemplos de buenos mensajes de commit

- `"Añadidas fotos reales de los jamones"`
- `"Actualizado horario de Navidad"`
- `"Fix: corregido error en formulario de contacto"`
- `"Cambiado precio del jamón de bellota"`

Mensaje malo: `"cambios"`, `"varias cosas"`, `"."` 👎

---

## Operaciones que hago sin código (Prisma Studio)

Para todas estas, abro Prisma Studio:

```powershell
cd backend
$env:DATABASE_URL="postgresql://Bartolome:Blarto0509@localhost:5432/ibericos_macarena?schema=public"
npm.cmd run prisma:studio
```

### Productos
- **Cambiar precio** → tabla `Product`, columna `price`
- **Cambiar descripción** → columna `description`
- **Marcar como destacado** (sale en la home) → columna `featured` a `true`
- **Quitar temporalmente sin borrarlo** → columna `active` a `false`
- **Cambiar foto** → columna `image`. URL relativa: `/static/products/foto.jpg`
- **Cambiar stock** → columna `stock`
- **Añadir producto nuevo** → "Add record". El `slug` debe ser único, en minúsculas, sin tildes (`jamon-cebo-200g`)

### Reseñas
- **Borrar reseña spam** → tabla `Review`, marcar y "Delete records"
- **Ocultar reseña sin borrarla** → columna `status` a `REJECTED`

### Usuarios
- **Ver cuentas registradas** → tabla `User`
- **NUNCA** tocar las columnas `password`, `id`, `createdAt`

⚠️ **Reglas de oro:**
- No borrar tablas enteras
- No tocar la columna `password` (rompe el hash bcrypt)
- No editar `id` ni `createdAt`

---

## Subir fotos nuevas

1. **Optimizar primero** en <https://squoosh.app> (objetivo: 200-400 KB, formato WebP o JPG calidad 80)
2. **Nombre limpio**: solo minúsculas, números, guiones (`jamon-iberico-bellota.jpg`)
3. **Copiar a la carpeta correcta**:
   - Productos → `static/products/`
   - Tienda → `static/tienda/`
4. **En Prisma Studio**, en el campo `image` del producto, escribir:
   ```
   /static/products/jamon-iberico-bellota.jpg
   ```
5. **Recargar la web** → foto visible

Si es para la galería: editar `index.html` añadiendo el script `window.GALLERY_IMAGES = [...]` con las URLs.

---

## Cambiar textos de la web

Casi todo el contenido está en `HTML/index.html`:

- **Teléfono**: buscar `+34 616 778 900`
- **Email**: buscar `ibericosmacarena@gmail.com`
- **Dirección**: buscar `Constitución 15`
- **Texto de "Sobre nosotros"**: buscar `Una charcutería con`
- **Hero (frase grande de la portada)**: cerca del principio del archivo

Después de cambiar:
1. Si el servidor corre con `npm run dev` → se recarga solo
2. `Ctrl+F5` en el navegador
3. `git add . && git commit -m "..." && git push`

---

## Si algo se rompe

### "Cannot find module 'X'"

Faltan dependencias:

```powershell
cd backend
npm install
```

### "DATABASE_URL resolved to empty string"

Olvidé poner el `$env:DATABASE_URL=...` antes del comando. Lo pongo y reintento.

### "port 4000 already in use"

Tengo otra instancia del servidor corriendo. La encuentro y la cierro:

```powershell
# Buscar qué proceso usa el puerto 4000
netstat -ano | findstr :4000
# Matarlo (sustituir <PID> por el número de la última columna)
taskkill /F /PID <PID>
```

### "prisma client did not initialize"

```powershell
npm.cmd run prisma:generate
```

### Algo en la web no se ve actualizado

`Ctrl+F5` (recarga ignorando caché). Casi siempre es eso.

### He hecho un cambio en código y rompió todo

```powershell
git status              # ver qué archivos tocé
git diff                # ver qué cambió
git checkout .          # ⚠️ descartar TODOS los cambios no commiteados
```

Si ya hice `git commit` pero no `git push` todavía:

```powershell
git reset --soft HEAD~1   # deshace el último commit (mantiene los cambios)
git reset --hard HEAD~1   # ⚠️ deshace el último commit Y los cambios
```

Si ya hice `push` y la web está rota → escribir a [Claude] o revisar el commit anterior:

```powershell
git log --oneline -5
git revert HEAD
git push
```

---

## Variables de entorno (`backend/.env`)

```env
NODE_ENV=development
PORT=4000

FRONTEND_URL=http://localhost:4000

JWT_SECRET=<aquí va el secret largo que generé con openssl>
JWT_EXPIRES_IN=7d

COOKIE_NAME=im_token
COOKIE_SECURE=false
COOKIE_SAMESITE=lax

DATABASE_URL=postgresql://Bartolome:Blarto0509@localhost:5432/ibericos_macarena?schema=public

LOG_LEVEL=info
```

⚠️ **NO subir nunca este archivo a Git.** Está en `.gitignore`.

Para producción habrá un `.env` distinto en Render con:
- `NODE_ENV=production`
- `DATABASE_URL=<la que dé Render>`
- `JWT_SECRET=<otro distinto, regenerado>`
- `COOKIE_SECURE=true`
- `FRONTEND_URL=https://ibericosmacarena.com`

---

## Estado actual del proyecto

✅ **Completado**
- Frontend completo y responsive
- Backend con autenticación, productos, reseñas
- BD PostgreSQL conectada con 21 productos sembrados
- Sistema de cookies RGPD
- Páginas legales (cookies, privacidad, aviso legal)
- Hardening de seguridad (rate limits, CSP, HSTS, validaciones)
- Repo en GitHub privado
- Dominio `ibericosmacarena.com` registrado en Cloudflare
- Cuenta Cloudflare con 2FA + códigos de respaldo
- Auto-renovación dominio activa
- Header con drawer hamburguesa
- Horario dinámico verano/invierno con estado en tiempo real
- 8 categorías reales de productos con filtros
- Galería con lightbox (esperando fotos reales)

⏳ **Pendiente para lanzar**
1. Recibir fotos reales de Macarena (productos + interior tienda)
2. Coordenadas GPS exactas del local (sustituir las aproximadas)
3. Crear cuenta en Render
4. Configurar variables de entorno de producción en Render
5. Apuntar DNS de Cloudflare → Render
6. Verificar HTTPS y certificado SSL
7. Crear Google Business Profile
8. Subir sitemap a Google Search Console

🔮 **Para más adelante (cuando escalemos a ecommerce)**
- Verificación de email al registro
- Pasarela de pago (Stripe / Redsys)
- Carrito de compra
- Histórico de pedidos
- Email transaccional (Resend)
- 2FA opcional para usuarios

---

## Notas para mí mismo

- Cuando trabaje en cambios "experimentales" (que pueden romper), creo una rama: `git checkout -b experimento`. Si va mal, vuelvo a `main` con `git checkout main` y la rama se queda ahí.
- Antes de hacer push, siempre `git status` para no subir nada raro.
- Las fotos pesadas matan el rendimiento. Optimizar SIEMPRE antes de subir.
- Los emails de Cloudflare sobre el dominio son importantes. No filtrarlos como spam.
- La cuenta de PostgreSQL local (`Bartolome` / `Blarto0509`) NO se usa en producción. Render generará otra distinta.

---

## Contactos importantes

- **Email del negocio**: ibericosmacarena@gmail.com
- **Cuenta Cloudflare**: bartolomeojeda2@gmail.com
- **Cuenta GitHub**: barto5907
- **Titular legal**: Macarena Padilla Higuera (NIF 75551154H)
- **Dirección del local**: Av. Constitución 15, 21710 Bollullos Par del Condado, Huelva
- **Teléfono del negocio**: +34 616 778 900

---

_Última actualización: mayo 2026_
