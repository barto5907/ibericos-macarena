// =============================================================
// src/utils/logger.js
// Logger minimalista y sin dependencias.
// Para producción seria, sustituible por pino/winston.
// =============================================================

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const colors = {
  debug: "\x1b[90m",
  info: "\x1b[36m",
  warn: "\x1b[33m",
  error: "\x1b[31m",
  reset: "\x1b[0m",
};

const currentLevel =
  LEVELS[(process.env.LOG_LEVEL || "info").toLowerCase()] ?? LEVELS.info;

function fmt(level, args) {
  const ts = new Date().toISOString();
  const tag = `${colors[level] || ""}[${level.toUpperCase()}]${colors.reset}`;
  return [`${ts} ${tag}`, ...args];
}

function emit(level, args) {
  if (LEVELS[level] < currentLevel) return;
  const out = level === "error" || level === "warn" ? console.error : console.log;
  out(...fmt(level, args));
}

export const logger = {
  debug: (...a) => emit("debug", a),
  info: (...a) => emit("info", a),
  warn: (...a) => emit("warn", a),
  error: (...a) => emit("error", a),
};
