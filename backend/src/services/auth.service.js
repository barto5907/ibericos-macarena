// =============================================================
// src/services/auth.service.js
// Lógica de registro y login.
// - Si Prisma está disponible → PostgreSQL
// - Si no                     → almacén en memoria (desarrollo)
// =============================================================

import bcrypt from "bcryptjs";
import { prisma, isPrismaReady } from "../config/prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { signToken } from "../utils/jwt.js";

// -------------------------------------------------------------
// Almacén en memoria (modo desarrollo / sin DB)
// -------------------------------------------------------------
const memoryUsers = new Map(); // email → { id, email, password, name, role }

let memSeq = 1;
const newId = () => `mem_${Date.now()}_${memSeq++}`;

// -------------------------------------------------------------
// Helpers
// -------------------------------------------------------------
function publicUser(u) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    createdAt: u.createdAt ?? new Date(),
  };
}

function tokenFor(user) {
  return signToken(
    { sub: user.id, email: user.email, name: user.name, role: user.role },
    {} // expiresIn ya viene del env
  );
}

// -------------------------------------------------------------
// Registro
// -------------------------------------------------------------
export async function registerUser({ name, email, password }) {
  const normalizedEmail = email.toLowerCase().trim();
  const hash = await bcrypt.hash(password, 12);

  if (isPrismaReady()) {
    try {
      const user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          password: hash,
          name: name.trim(),
          role: "CUSTOMER",
        },
      });
      return { user: publicUser(user), token: tokenFor(user) };
    } catch (err) {
      // P2002 = unique constraint
      if (err.code === "P2002") {
        throw ApiError.conflict("Ya existe una cuenta con ese email");
      }
      throw err;
    }
  }

  // Modo memoria
  if (memoryUsers.has(normalizedEmail)) {
    throw ApiError.conflict("Ya existe una cuenta con ese email");
  }
  const user = {
    id: newId(),
    email: normalizedEmail,
    password: hash,
    name: name.trim(),
    role: "CUSTOMER",
    createdAt: new Date(),
  };
  memoryUsers.set(normalizedEmail, user);
  return { user: publicUser(user), token: tokenFor(user) };
}

// -------------------------------------------------------------
// Login
// -------------------------------------------------------------
export async function loginUser({ email, password }) {
  const normalizedEmail = email.toLowerCase().trim();

  let user;
  if (isPrismaReady()) {
    user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  } else {
    user = memoryUsers.get(normalizedEmail);
  }

  // Mensaje genérico para no filtrar si el email existe (anti-enumeración)
  if (!user) throw ApiError.unauthorized("Email o contraseña incorrectos");

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw ApiError.unauthorized("Email o contraseña incorrectos");

  return { user: publicUser(user), token: tokenFor(user) };
}

// -------------------------------------------------------------
// Obtener el usuario autenticado (para /me)
// -------------------------------------------------------------
export async function getUserById(id) {
  if (isPrismaReady()) {
    const u = await prisma.user.findUnique({ where: { id } });
    return u ? publicUser(u) : null;
  }
  for (const u of memoryUsers.values()) if (u.id === id) return publicUser(u);
  return null;
}
