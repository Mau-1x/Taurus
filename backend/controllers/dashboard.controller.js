const DashboardModel = require("../models/dashboard.model");

class DashboardController {
  static async obtenerDashboard(req, res) {
    try {
      const resumen = await DashboardModel.obtenerResumen();
      const reparacionesRecientes =
        await DashboardModel.obtenerReparacionesRecientes();

      return res.json({
        ok: true,
        data: {
          resumen,
          reparacionesRecientes,
        },
      });
    } catch (error) {
      console.error("Error en dashboard:", error);

      return res.status(500).json({
        ok: false,
        message: "No se pudo cargar el dashboard",
        error: error.message,
      });
    }
  }
}

module.exports = DashboardController;