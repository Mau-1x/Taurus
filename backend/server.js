const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { getConnection } = require("./config/database");

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

const origenesPermitidos = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origen, callback) {
      if (!origen || origenesPermitidos.includes(origen)) {
        return callback(null, true);
      }

      return callback(
        new Error("Origen no permitido por CORS")
      );
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "API de Taurus funcionando",
  });
});

app.get("/api/test-db", async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT
        DB_NAME() AS databaseName,
        GETDATE() AS serverDate
    `);

    return res.json({
      ok: true,
      message: "Conexión con la base de datos correcta",
      data: result.recordset[0],
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "No se pudo conectar con la base de datos",
      error: error.message,
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/clientes", clienteRoutes);
app.use("/api/equipos", equipoRoutes);
app.use("/api/reparaciones", reparacionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/ventas", ventaRoutes);
app.use("/api/reservas", reservaRoutes);
app.use("/api/reportes", reporteRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/auditoria", auditoriaRoutes);

app.use((req, res) => {
  return res.status(404).json({
    ok: false,
    message: "Ruta no encontrada",
  });
});

app.use((error, req, res, next) => {
  console.error("Error no controlado:", error);

  return res.status(500).json({
    ok: false,
    message: "Ocurrió un error interno en el servidor",
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor Taurus ejecutándose en el puerto ${PORT}`);
});