# Ibéricos Macarena

Web completa para una charcutería de Bollullos Par del Condado (Huelva): catálogo de productos, reseñas de clientes con cuentas de usuario, galería de fotos, horario en tiempo real y páginas legales. Es un proyecto real, desarrollado de principio a fin y en producción.

🌐 **En producción:** [ibericosmacarena.com](https://ibericosmacarena.com)

## Qué hace

- **Catálogo** de 21 productos en 8 categorías, servido desde PostgreSQL. Los precios, el stock y las descripciones se editan sin tocar código.
- **Cuentas de usuario y reseñas.** Solo los usuarios registrados pueden dejar una reseña, y su nombre se toma de la sesión, no del formulario.
- **Horario dinámico** de verano e invierno, con el estado «Abierto ahora / Cerrado» calculado en tiempo real con la zona horaria de Madrid.
- **Galería** de 17 fotos con visor ampliado (lightbox), con miniaturas ligeras y versión grande.
- **SEO local:** datos estructurados JSON-LD con la valoración media real, `sitemap.xml` y `robots.txt`.
- **Páginas legales** conforme a RGPD, LOPDGDD y LSSI-CE: cookies, privacidad y aviso legal.

## Tecnologías

| Capa | Tecnología |
|---|---|
| Servidor | Node.js 18+, Express 4 |
| Base de datos | PostgreSQL con Prisma 5 (migraciones incluidas) |
| Validación | Zod |
| Seguridad | JWT en cookie httpOnly, bcrypt, Helmet (CSP y HSTS), express-rate-limit |
| Frontend | HTML, CSS y JavaScript sin frameworks |
| Despliegue | Render (servicio web y base de datos), Cloudflare para dominio y DNS |

## Decisiones de diseño

- **Un único servicio.** Express sirve la API y también el frontend, así que todo vive bajo el mismo dominio y no hace falta configurar CORS entre partes.
- **Arquitectura por capas:** rutas → controladores → servicios, con middleware para autenticación, validación, límites de peticiones y errores.
- **Validación en todas las entradas** con Zod. Cada endpoint declara qué forma tiene lo que acepta y rechaza el resto.
- **Seguridad pensada desde el inicio:** contraseñas con bcrypt (coste 12), sesiones en cookie httpOnly, límites de peticiones por IP en login, registro y reseñas, y cabeceras de seguridad con Helmet. En producción el servidor se niega a arrancar si detecta el `JWT_SECRET` de desarrollo.
- **Una sola fuente de verdad para el horario.** De un único módulo salen el indicador de abierto o cerrado, la tabla de contacto y los datos que lee Google.
- **Modo memoria de respaldo.** Si no hay base de datos disponible, la API responde con datos locales para que la web no se vea rota.

## Estructura

```
ibericos-macarena/
├── HTML/             páginas: inicio, galería y legales
├── Styles/           hoja de estilos
├── JS/               comportamiento del frontend
├── static/           imágenes (galería, marca, fachada)
└── backend/
    ├── server.js
    ├── prisma/       esquema y migraciones
    └── src/
        ├── app.js         Express, seguridad y servidor de estáticos
        ├── routes/        endpoints de la API
        ├── controllers/   capa HTTP
        ├── services/      lógica de negocio
        ├── middleware/    autenticación, validación, límites, errores
        ├── utils/         JWT, horarios, logger
        └── data/          datos iniciales (seed)
```

## Ejecutarlo en local

Requisitos: Node.js 18 o superior. PostgreSQL es opcional: sin base de datos el servidor arranca en modo memoria con datos de ejemplo.

```bash
git clone https://github.com/barto5907/ibericos-macarena.git
cd ibericos-macarena/backend
cp .env.example .env     # y ajusta los valores
npm install
npm run dev
```

Se abre en <http://localhost:4000>.

Para usar PostgreSQL, rellena `DATABASE_URL` en el `.env` y ejecuta:

```bash
npm run prisma:migrate   # crea las tablas
npm run prisma:seed      # carga los productos iniciales
```

## Documentación de la API

Los endpoints, los modelos de datos, los límites de peticiones y los detalles de seguridad y despliegue están en [`backend/README.md`](backend/README.md).

## Despliegue

Cada cambio que se sube a la rama `main` se despliega automáticamente en Render.

## Autor

Desarrollado por **Bartolomé Ojeda Padilla** ([@barto5907](https://github.com/barto5907)), estudiante de 2º de Desarrollo de Aplicaciones Multiplataforma.

Los textos, las fotografías y la marca pertenecen a Ibéricos Macarena y se publican con su autorización. El código se comparte con fines de portfolio.
