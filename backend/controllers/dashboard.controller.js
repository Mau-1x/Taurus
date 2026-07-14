const DashboardModel = require(
  "../models/dashboard.model"
);

class DashboardController {
  static async obtenerDashboard(req, res) {
    try {
      const [
        resumen,
        reparacionesRecientes,
        reparacionesAtrasadas,
        productosStockBajo,
        pagosRecientes,
      ] = await Promise.all([
        DashboardModel.obtenerResumen(),
        DashboardModel.obtenerReparacionesRecientes(),
        DashboardModel.obtenerReparacionesAtrasadas(),
        DashboardModel.obtenerProductosStockBajo(),
        DashboardModel.obtenerPagosRecientes(),
      ]);

      return res.json({
        ok: true,
        data: {
          resumen,
          reparacionesRecientes,
          reparacionesAtrasadas,
          productosStockBajo,
          pagosRecientes,
        },
      });
    } catch (error) {
      console.error(
        "Error cargando dashboard:",
        error
      );

      return res.status(500).json({
        ok: false,
        message:
          "No se pudo cargar el dashboard",
      });
    }
  }
}

module.exports = DashboardController;
