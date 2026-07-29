# Ibéricos Macarena · Web del negocio

Charcutería en Bollullos Par del Condado, Huelva.
**En producción:** https://ibericosmacarena.com

> Esta es mi chuleta: comandos del día a día, dónde está cada cosa y qué hacer
> cuando algo falla. No es documentación para nadie más.

---

## Dónde está cada cosa

| | |
|---|---|
| **Web** | https://ibericosmacarena.com (y `www`, que redirige) |
| **URL de respaldo** | https://ibericos-macarena.onrender.com |
| **Hosting** | Render · servicio `ibericos-macarena` (Starter, Frankfurt) |
| **Base de datos** | Render PostgreSQL · `ibericos-macarena-db` (Basic-256mb, Frankfurt) |
| **Dominio y DNS** | Cloudflare · cuenta `bartolomeojeda2@gmail.com` |
| **Repositorio** | https://github.com/barto5907/ibericos-macarena (privado) |
| **Carpeta local** | `D:\Documentos\ibericos-macarena` |

**Coste:** unos 13 $/mes (7 web + 6 base de datos) más el dominio (~10 $/año).

---

## Lo que hay que entender antes de tocar nada

El contenido vive en **dos sitios distintos**:

| Qué cambias | Dónde | Cuándo se ve |
|---|---|---|
| Precios, stock, descripciones, fotos de producto | **Prisma Studio** | al instante |
| Reseñas (borrar spam, ocultar) | **Prisma Studio** | al instante |
| Textos, horarios, diseño, fotos de galería | **Código + `git push`** | en 2-4 minutos |

Si cambio un precio en el código en vez de en la base de datos, no pasa nada:
la web lee los productos de PostgreSQL, no del archivo.

---

## Estructura

```
ibericos-macarena/
├── HTML/
│   ├── index.html        ← la página principal (la que más se toca)
│   ├── galeria.html      ← galería completa
│   ├── cookies.html
│   ├── privacidad.html
│   └── aviso-legal.html
├── Styles/styles.css     ← todo el diseño, un solo archivo
├── JS/script.js          ← animaciones, formularios, galería, horario
├── static/
│   ├── galeria/thumb/    ← miniaturas de la galería (800 px)
│   ├── galeria/full/     ← versión grande del lightbox (1800 px)
│   ├── tienda/           ← fachada
│   └── marca/            ← logo, favicons, imagen para compartir
└── backend/
    ├── server.js
    ├── .env              ← ⚠️ credenciales, NO se sube a Git
    ├── prisma/schema.prisma
    └── src/
        ├── app.js        ← Express, seguridad, sirve el frontend
        ├── routes/       ← endpoints de la API
        ├── controllers/  ← lógica de cada endpoint
        ├── services/     ← lógica de negocio
        ├── middleware/   ← auth, validaciones, límites de peticiones
        ├── utils/        ← JWT, horarios, logger
        └── data/         ← seeds (productos, reseñas)
```

---

## Comandos

Todo desde `D:\Documentos\ibericos-macarena`.
**Ya no hace falta `$env:DATABASE_URL`**: aquello era por el bug de Prisma con
las tildes de la carpeta antigua. Ahora el `.env` se carga solo.

### Día a día

```powershell
# Arrancar en local (recarga sola al editar)
cd D:\Documentos\ibericos-macarena\backend
npm run dev
```
→ http://localhost:4000 · parar con `Ctrl+C`

```powershell
# Ver y editar la base de datos LOCAL (en otra terminal)
cd D:\Documentos\ibericos-macarena\backend
npm run prisma:studio
```
→ http://localhost:5555

### Publicar cambios

```powershell
cd D:\Documentos\ibericos-macarena
git status          # ver qué he tocado
git add .
git commit -m "Descripción breve"
git push            # Render despliega solo en 2-4 min
```

⚠️ `git` va desde la **raíz**, `npm` desde **`backend`**. Si hago `git add .`
estando dentro de `backend`, solo subo el backend.

### Ocasionales

```powershell
cd D:\Documentos\ibericos-macarena\backend

npm start                       # arrancar sin recarga automática
npm run prisma:seed             # sembrar productos nuevos
npm run prisma:seed -- --force  # además, actualizar los existentes
npm run prisma:generate         # tras cambiar schema.prisma
npm run prisma:migrate          # crear migración en local
npm install                     # si falta alguna dependencia
```

---

## Tocar la base de datos DE PRODUCCIÓN

Solo cuando haga falta de verdad. Necesito la **External Database URL**
(Render → base de datos → Connections).

```powershell
cd D:\Documentos\ibericos-macarena\backend
$env:DATABASE_URL="postgresql://...(External Database URL)"
npm run prisma:studio     # o prisma:seed
```

⚠️ **Cerrar esa terminal al terminar.** Mientras siga abierta, esa variable
apunta a producción: si luego lanzo `npm run dev` ahí, estaría tocando los
datos reales creyendo que trabajo en local.

---

## Cosas que hago a menudo

### Cambiar el precio de un producto
Prisma Studio → tabla `Product` → columna `price`. Se ve al instante.

### Poner la foto de un producto
1. Optimizar en https://squoosh.app (200-400 KB, WebP o JPG calidad 80)
2. Nombre en minúsculas y sin tildes: `jamon-iberico-bellota.webp`
3. Guardarla en `static/products/`
4. `git add . && git commit -m "..." && git push`
5. Prisma Studio → `Product` → campo `image` →
   `/static/products/jamon-iberico-bellota.webp`

### Añadir una foto a la galería
1. Dos versiones: 800 px en `static/galeria/thumb/` y 1800 px en
   `static/galeria/full/`, con el mismo nombre
2. Añadir la entrada en el bloque `window.GALLERY_IMAGES` de `HTML/galeria.html`
   (todas) y, si quiero que salga en la home, también en `HTML/index.html`
   (adelanto de 6)
3. `git push`

### Borrar una reseña
Prisma Studio → tabla `Review` → seleccionar → Delete records.
Para ocultarla sin borrarla: columna `status` a `REJECTED`.

### Cambiar textos
Casi todo está en `HTML/index.html`. Buscar con `Ctrl+F`: los teléfonos,
`macarenapadillahiguera@gmail.com`, `Constitución 15`, "Una charcutería con".
Después, `git push`.

### Cambiar el horario
Está en `backend/src/utils/businessHours.js`, donde se definen verano
(1 julio – 31 agosto) e invierno. Cambiarlo ahí actualiza a la vez la píldora
de "Abierto/Cerrado", la tabla de contacto y lo que lee Google.

⚠️ Si cambia el horario, actualizarlo **también en la ficha de Google Business**.
Si no coinciden, Google penaliza en búsquedas locales.

---

## Reglas de oro con la base de datos

- No borrar tablas enteras
- No tocar la columna `password` (rompe el hash de bcrypt)
- No editar `id` ni `createdAt`
- El `slug` de un producto debe ser único, en minúsculas y sin tildes

---

## Si algo falla

| Error | Solución |
|---|---|
| `Cannot find module 'X'` | `npm install` en `backend/` |
| `port 4000 already in use` | Otro servidor abierto: `netstat -ano \| findstr :4000` y `taskkill /F /PID <n>` |
| `prisma client did not initialize` | `npm run prisma:generate` |
| La web no refleja el cambio | `Ctrl+F5` (caché del navegador) |
| Hice push y la web pública sigue igual | Render → Events. Si no hay despliegue, revisar Settings → Build Filters |

### Deshacer

```powershell
git status              # ver qué toqué
git diff                # ver exactamente qué cambió
git checkout .          # ⚠️ descartar TODO lo no commiteado
git reset --soft HEAD~1 # deshacer el último commit, conservando los cambios
```

Si ya hice push y rompí la web: Render → Events → **Rollback** en el último
despliegue que funcionaba. Es lo más rápido.

---

## Variables de entorno

**Local** (`backend/.env`, no se sube a Git):

```env
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:4000
JWT_SECRET=<el largo generado con crypto>
JWT_EXPIRES_IN=7d
COOKIE_NAME=im_token
COOKIE_SECURE=false
COOKIE_SAMESITE=lax
DATABASE_URL=postgresql://...@localhost:5432/ibericos_macarena?schema=public
LOG_LEVEL=info
```

**Producción** (Render → servicio → Environment): las mismas, pero con
`NODE_ENV=production`, `COOKIE_SECURE=true`, un `JWT_SECRET` distinto,
`FRONTEND_URL=https://ibericosmacarena.com,https://ibericos-macarena.onrender.com`
y la `DATABASE_URL` **interna** de Render.

---

## Estado

✅ **Hecho**
- Web en producción con dominio propio y certificado SSL
- 21 productos en PostgreSQL, editables desde Prisma Studio
- Cuentas de usuario y reseñas (solo para gente registrada)
- Galería con 17 fotos y página propia
- Horario dinámico verano/invierno con estado en tiempo real
- Páginas legales (cookies, privacidad, aviso legal)
- Seguridad: límites de peticiones, CSP, HSTS, bcrypt, cookies httpOnly
- Ficha de Google Business y Search Console
- Despliegue automático: `git push` publica

⏳ **Pendiente**
- Fotos reales en los productos (ahora sale la "M" de relleno)
- Primeras reseñas de clientes
- Confirmar que el horario de la web coincide con el del escaparate:
  el cartel dice tardes solo jueves y viernes, la web dice lunes a viernes

🔮 **Si algún día hay tienda online**
- Verificación de email al registrarse (entonces sí es imprescindible)
- Pasarela de pago, carrito, historial de pedidos
- Email transaccional (Resend o similar)

---

## Datos del negocio

- **Titular:** Macarena Padilla Higuera · NIF 75551154H
- **Dirección:** Av. Constitución 15, 21710 Bollullos Par del Condado, Huelva
- **Coordenadas:** 37.33956, -6.53744
- **Teléfonos:** +34 616 778 900 · +34 642 914 308
- **Email:** macarenapadillahiguera@gmail.com
- **Cuentas:** GitHub `barto5907` · Cloudflare y Render `bartolomeojeda2@gmail.com`

---

_Última actualización: julio de 2026_
