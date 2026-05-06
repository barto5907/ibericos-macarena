// =============================================================
// src/middleware/validate.middleware.js
// Valida body / query / params contra un schema Zod.
// =============================================================

import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError.js";

/**
 * Uso:
 *   router.post('/x', validate({ body: schemaZod }), controller);
 *   router.get('/x',  validate({ query: schemaZod }), controller);
 */
export function validate(schemas) {
  return (req, _res, next) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) req.query = schemas.query.parse(req.query);
      if (schemas.params) req.params = schemas.params.parse(req.params);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.errors.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        }));
        return next(
          ApiError.unprocessable("Datos no válidos", {
            code: "VALIDATION_ERROR",
            details,
          })
        );
      }
      next(err);
    }
  };
}
