// =============================================================
// src/utils/businessHours.js
// Horarios del negocio con detección verano/invierno + estado.
//
// Verano (1 julio – 31 agosto):
//   Lunes a viernes: 09:00 - 14:00
//
// Invierno (resto del año):
//   Lunes a sábado: 09:00 - 14:00
//   Lunes a viernes: 18:00 - 20:00
//
// Domingos: cerrado siempre.
// =============================================================

const TIMEZONE = "Europe/Madrid";

/**
 * Devuelve la fecha "ahora mismo" en la zona horaria de Madrid,
 * como un objeto con campos enteros listos para usar.
 */
function nowInMadrid() {
  // Intl.DateTimeFormat con timeZone es la forma fiable de obtener la
  // hora local de Madrid sin depender de la TZ del servidor.
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hour12: false,
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(new Date()).map((p) => [p.type, p.value])
  );
  // weekday viene como "Mon", "Tue"…
  const weekdayMap = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour) % 24,
    minute: Number(parts.minute),
    weekday: weekdayMap[parts.weekday], // 0 dom, 1 lun, … 6 sáb
  };
}

/**
 * ¿Estamos en horario de verano?
 * (1 julio – 31 agosto inclusive)
 */
export function isSummerSeason(now = nowInMadrid()) {
  return now.month === 7 || now.month === 8;
}

/**
 * Lista de tramos horarios para un día concreto.
 * @returns {Array<{opens:string, closes:string}>}
 */
export function getDaySlots(weekday, summer = isSummerSeason()) {
  // Domingo siempre cerrado
  if (weekday === 0) return [];

  if (summer) {
    // Verano: solo lun-vie de 9 a 14
    if (weekday >= 1 && weekday <= 5) {
      return [{ opens: "09:00", closes: "14:00" }];
    }
    return []; // sábado en verano: cerrado
  }

  // Invierno
  if (weekday === 6) {
    // Sábado: solo mañana
    return [{ opens: "09:00", closes: "14:00" }];
  }
  // Lunes-viernes: mañana + tarde
  return [
    { opens: "09:00", closes: "14:00" },
    { opens: "18:00", closes: "20:00" },
  ];
}

/**
 * Estado actual del negocio: abierto/cerrado, próxima apertura/cierre.
 */
export function getBusinessStatus(now = nowInMadrid()) {
  const summer = isSummerSeason(now);
  const todaySlots = getDaySlots(now.weekday, summer);
  const nowMinutes = now.hour * 60 + now.minute;

  const toMin = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };

  // ¿Estamos dentro de algún tramo de hoy?
  for (const slot of todaySlots) {
    const o = toMin(slot.opens);
    const c = toMin(slot.closes);
    if (nowMinutes >= o && nowMinutes < c) {
      return {
        open: true,
        season: summer ? "summer" : "winter",
        closesAt: slot.closes,
        message: `Abrimos hasta las ${slot.closes}`,
      };
    }
  }

  // No estamos abiertos: buscar próxima apertura (hoy o días siguientes)
  // Mira los tramos de hoy aún por venir
  for (const slot of todaySlots) {
    if (nowMinutes < toMin(slot.opens)) {
      return {
        open: false,
        season: summer ? "summer" : "winter",
        opensAt: slot.opens,
        opensDay: "today",
        message: `Hoy abrimos a las ${slot.opens}`,
      };
    }
  }

  // Buscar el próximo día con horario
  for (let i = 1; i <= 7; i++) {
    const wd = (now.weekday + i) % 7;
    const slots = getDaySlots(wd, summer);
    if (slots.length > 0) {
      const dayLabels = [
        "domingo", "lunes", "martes", "miércoles",
        "jueves", "viernes", "sábado",
      ];
      const label = i === 1 ? "mañana" : dayLabels[wd];
      return {
        open: false,
        season: summer ? "summer" : "winter",
        opensAt: slots[0].opens,
        opensDay: label,
        message: `${label.charAt(0).toUpperCase() + label.slice(1)} abrimos a las ${slots[0].opens}`,
      };
    }
  }

  return {
    open: false,
    season: summer ? "summer" : "winter",
    message: "Cerrado",
  };
}

/**
 * Resumen del horario completo (para mostrar tabla en la web).
 */
export function getWeekSchedule(summer = isSummerSeason()) {
  const days = [
    { weekday: 1, label: "Lunes" },
    { weekday: 2, label: "Martes" },
    { weekday: 3, label: "Miércoles" },
    { weekday: 4, label: "Jueves" },
    { weekday: 5, label: "Viernes" },
    { weekday: 6, label: "Sábado" },
    { weekday: 0, label: "Domingo" },
  ];
  return days.map((d) => ({
    ...d,
    slots: getDaySlots(d.weekday, summer),
  }));
}

/**
 * Para Schema.org: array openingHoursSpecification según temporada.
 */
export function getOpeningHoursSpec(summer = isSummerSeason()) {
  if (summer) {
    return [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "14:00",
        validFrom: `${new Date().getFullYear()}-07-01`,
        validThrough: `${new Date().getFullYear()}-08-31`,
      },
    ];
  }
  return [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "14:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "18:00",
      closes: "20:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "09:00",
      closes: "14:00",
    },
  ];
}
