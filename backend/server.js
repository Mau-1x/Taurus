const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

require("dotenv").config();

const {
  getConnection,
} = require("./config/database");

const {
  apiLimiter,
} = require("./middlewares/rateLimit.middleware");

const {
  rutaNoEncontrada,
  manejarErrores,
} = require("./middlewares/error.middleware");

const clienteRoutes = require("./routes/cliente.routes");
const equipoRoutes = require("./routes/equipo.routes");
const reparacionRoutes = require("./routes/reparacion.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const productoRoutes = require("./routes/producto.routes");
const ventaRoutes = require("./routes/venta.routes");
const reservaRoutes = require("./routes/reserva.routes");
const authRoutes = require("./routes/auth.routes");
const reporteRoutes = require("./routes/reporte.routes");
const usuarioRoutes = require("./routes/usuario.routes");
const auditoriaRoutes = require("./routes/auditoria.routes");

const app = express();

const esProduccion =
  process.env.NODE_ENV === "production";

function validarConfiguracion() {
  if (!process.env.JWT_SECRET) {
    throw new Error(
      "Falta configurar JWT_SECRET"
    );
  }

  if (
    esProduccion &&
    process.env.JWT_SECRET.length < 32
  ) {
    console.warn(
      "ADVERTENCIA: JWT_SECRET debería tener al menos 32 caracteres."
    );
  }
}

function normalizarOrigen(origen) {
  return String(origen || "")
    .trim()
    .replace(/\/+$/, "");
}

function obtenerOrigenesPermitidos() {
  const configurados = [
    process.env.FRONTEND_URL,
    ...(process.env.FRONTEND_URLS || "")
      .split(","),
  ];

  return new Set(
    [
      "http://localhost:5173",
      "https://taurus-1.onrender.com",
      ...configurados,
    ]
      .map(normalizarOrigen)
      .filter(Boolean)
  );
}

validarConfiguracion();

if (esProduccion) {
  /*
   * Render coloca la aplicación detrás de un proxy.
   * Esto permite obtener correctamente la IP usada
   * por los limitadores de solicitudes.
   */
  app.set("trust proxy", 1);
}

app.disable("x-powered-by");

const opcionesHelmet = {
  crossOriginResourcePolicy: {
    policy: "cross-origin",
  },
};

if (!esProduccion) {
  opcionesHelmet.strictTransportSecurity =
    false;
}

app.use(helmet(opcionesHelmet));

app.use((req, res, next) => {
  const idRecibido = String(
    req.get("x-request-id") || ""
  )
    .trim()
    .slice(0, 100);

  req.idSolicitud =
    idRecibido || crypto.randomUUID();

  res.setHeader(
    "X-Request-Id",
    req.idSolicitud
  );

  next();
});

const origenesPermitidos =
  obtenerOrigenesPermitidos();

const opcionesCors = {
  origin(origen, callback) {
    /*
     * Se permiten solicitudes sin Origin, por ejemplo
     * desde herramientas del servidor o verificadores.
     */
    if (!origen) {
      return callback(null, true);
    }

    const origenNormalizado =
      normalizarOrigen(origen);

    if (
      origenesPermitidos.has(
        origenNormalizado
      )
    ) {
      return callback(null, true);
    }

    const error = new Error(
      "Origen no permitido por CORS"
    );

    error.code = "CORS_NOT_ALLOWED";
    error.statusCode = 403;

    return callback(error);
  },
  credentials: true,
  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Request-Id",
  ],
  exposedHeaders: [
    "RateLimit",
    "RateLimit-Policy",
    "X-Request-Id",
  ],
  maxAge: 86400,
};

app.use(cors(opcionesCors));

app.use(
  express.json({
    limit: "500kb",
    strict: true,
  })
);

app.use(
  express.urlencoded({
    extended: false,
    limit: "100kb",
  })
);

app.get("/", (req, res) => {
  res.setHeader(
    "Cache-Control",
    "no-store"
  );

  return res.json({
    ok: true,
    message:
      "API de Taurus funcionando",
  });
});

app.get("/api/health", async (req, res) => {
  res.setHeader(
    "Cache-Control",
    "no-store"
  );

  try {
    const pool =
      await getConnection();

    await pool
      .request()
      .query("SELECT 1 AS ok");

    return res.json({
      ok: true,
      status: "healthy",
      database: "connected",
      timestamp:
        new Date().toISOString(),
      uptimeSeconds:
        Math.floor(process.uptime()),
    });
  } catch (error) {
    console.error(
      `[${req.idSolicitud}] Error en health check:`,
      error
    );

    return res.status(503).json({
      ok: false,
      status: "unhealthy",
      database: "unavailable",
      timestamp:
        new Date().toISOString(),
      requestId:
        req.idSolicitud,
    });
  }
});

/*
 * Límite general para todas las rutas de la API.
 * El health check queda fuera para permitir monitoreo.
 */
app.use("/api", apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/clientes", clienteRoutes);
app.use("/api/equipos", equipoRoutes);
app.use(
  "/api/reparaciones",
  reparacionRoutes
);
app.use(
  "/api/dashboard",
  dashboardRoutes
);
app.use("/api/productos", productoRoutes);
app.use("/api/ventas", ventaRoutes);
app.use("/api/reservas", reservaRoutes);
app.use("/api/reportes", reporteRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use(
  "/api/auditoria",
  auditoriaRoutes
);

app.use(rutaNoEncontrada);
app.use(manejarErrores);

const PORT =
  Number(process.env.PORT) || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Servidor Taurus ejecutándose en el puerto ${PORT}`
  );
});
