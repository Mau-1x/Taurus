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
const {
  verificarToken,
  permitirRoles,
} = require("./middlewares/auth.middleware");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

// Públicas
app.use("/api/reservas", reservaRoutes);
app.use("/api/reparaciones", reparacionRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/clientes", clienteRoutes);
app.use("/api/equipos", equipoRoutes);
app.use("/api/reparaciones", reparacionRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/ventas", ventaRoutes);
app.use("/api/reservas", reservaRoutes);
app.use("/api/reportes", reporteRoutes);
app.use("/api/usuarios", usuarioRoutes);

const PORT = process.env.PORT || 3000;

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

    res.json({
      ok: true,
      message: "Conexión con la base de datos correcta",
      data: result.recordset[0],
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "No se pudo conectar con la base de datos",
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor Taurus ejecutándose en http://localhost:${PORT}`);
});