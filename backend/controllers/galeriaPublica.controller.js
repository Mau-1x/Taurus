const GaleriaPublicaModel = require(
  "../models/galeriaPublica.model"
);

class GaleriaPublicaController {
  static async obtenerGaleria(req, res) {
    try {
      const limiteSolicitado = Number(
        req.query.limite || 8
      );

      const limite =
        Number.isInteger(limiteSolicitado)
          ? Math.min(
              Math.max(
                limiteSolicitado,
                1
              ),
              12
            )
          : 8;

      const fotos =
        await GaleriaPublicaModel.obtenerFotos(
          limite
        );

      return res.json({
        ok: true,
        total: fotos.length,
        data: fotos,
      });
    } catch (error) {
      console.error(
        "Error obteniendo galería pública:",
        error
      );

      return res.status(500).json({
        ok: false,
        message:
          "No se pudo cargar la galería de trabajos",
      });
    }
  }
}

module.exports = GaleriaPublicaController;
