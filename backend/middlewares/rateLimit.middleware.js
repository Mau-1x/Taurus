const {
  rateLimit,
} = require("express-rate-limit");

function crearLimitador({
  windowMs,
  limit,
  mensaje,
  identificador,
  skipSuccessfulRequests = false,
}) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    ipv6Subnet: 56,
    identifier: identificador,
    skip(req) {
      return req.method === "OPTIONS";
    },
    skipSuccessfulRequests,
    message: {
      ok: false,
      message: mensaje,
    },
    handler(req, res, next, opciones) {
      return res
        .status(opciones.statusCode)
        .json(opciones.message);
    },
  });
}

const apiLimiter = crearLimitador({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  identificador: "api-general",
  mensaje:
    "Se realizaron demasiadas solicitudes. Inténtalo nuevamente en unos minutos.",
});

const loginLimiter = crearLimitador({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  identificador: "inicio-sesion",
  skipSuccessfulRequests: true,
  mensaje:
    "Se realizaron demasiados intentos de inicio de sesión. Espera 15 minutos.",
});

const seguimientoLimiter =
  crearLimitador({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    identificador:
      "seguimiento-publico",
    mensaje:
      "Se realizaron demasiadas consultas de seguimiento. Inténtalo más tarde.",
  });

const operacionSensibleLimiter =
  crearLimitador({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    identificador:
      "operacion-sensible",
    mensaje:
      "Se realizaron demasiadas operaciones sensibles. Inténtalo más tarde.",
  });

const subidaImagenLimiter =
  crearLimitador({
    windowMs: 60 * 60 * 1000,
    limit: 30,
    identificador:
      "subida-imagen",
    mensaje:
      "Se realizaron demasiadas cargas de imágenes. Inténtalo más tarde.",
  });

module.exports = {
  apiLimiter,
  loginLimiter,
  seguimientoLimiter,
  operacionSensibleLimiter,
  subidaImagenLimiter,
};
