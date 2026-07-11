const ReporteModel = require("../models/reporte.model");

class ReporteController {
  static async obtenerReporteGeneral(req, res) {
    try {
      const [
        resumen,
        ventasRecientes,
        reparacionesRecientes,
        stockBajo,
        ventasPorMes,
      ] = await Promise.all([
        ReporteModel.obtenerResumen(),
        ReporteModel.obtenerVentasRecientes(),
        ReporteModel.obtenerReparacionesRecientes(),
        ReporteModel.obtenerStockBajo(),
        ReporteModel.obtenerVentasPorMes(),
      ]);

      return res.json({
        ok: true,
        data: {
          resumen,
          ventasRecientes,
          reparacionesRecientes,
          stockBajo,
          ventasPorMes,
        },
      });
    } catch (error) {
      console.error("Error obteniendo reportes:", error);

      return res.status(500).json({
        ok: false,
        message: "No se pudieron obtener los reportes",
        error: error.message,
      });
    }
  }
}

module.exports = ReporteController;