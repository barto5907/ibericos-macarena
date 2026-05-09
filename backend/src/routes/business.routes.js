// =============================================================
// src/routes/business.routes.js
// Endpoints públicos sobre el negocio: horario, estado abierto/cerrado.
// =============================================================

import { Router } from "express";
import {
  getBusinessStatus,
  getWeekSchedule,
  isSummerSeason,
} from "../utils/businessHours.js";

export const businessRouter = Router();

// GET /api/business/status
// Estado actual + horario de la semana en una sola respuesta.
businessRouter.get("/status", (_req, res) => {
  const summer = isSummerSeason();
  res.json({
    status: getBusinessStatus(),
    schedule: getWeekSchedule(summer),
    season: summer ? "summer" : "winter",
    seasonLabel: summer ? "Horario de verano" : "Horario de invierno",
    timezone: "Europe/Madrid",
  });
});
