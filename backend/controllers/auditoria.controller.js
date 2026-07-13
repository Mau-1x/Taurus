const AuditoriaModel = require(
  "../models/auditoria.model"
);

class AuditoriaController {
  static async obtenerTodos(req, res) {
    try {
      const modulo =
        req.query.modulo?.trim().toUpperCase() || null;

      const accion =
        req.query.accion?.trim().toUpperCase() || null;

      const idUsuario = req.query.idUsuario
        ? Number(req.query.idUsuario)
        : null;

      if (
        idUsuario !== null &&
        (!Number.isInteger(idUsuario) ||
          idUsuario <= 0)
      ) {
        return res.status(400).json({
          ok: false,
          message: "El usuario seleccionado no es válido",
        });
      }

      const registros =
        await AuditoriaModel.obtenerTodos({
          modulo,
          accion,
          idUsuario,
        });

      return res.json({
        ok: true,
        total: registros.length,
        data: registros,
      });
    } catch (error) {
      console.error(
        "Error obteniendo auditoría:",
        error
      );

      return res.status(500).json({
        ok: false,
        message:
          "No se pudieron obtener los registros de auditoría",
        error: error.message,
      });
    }
  }
}

module.exports = AuditoriaController;