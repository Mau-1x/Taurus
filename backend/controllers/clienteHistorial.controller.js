const ClienteHistorialModel = require(
  "../models/clienteHistorial.model"
);

class ClienteHistorialController {
  static async obtenerHistorial(req, res) {
    try {
      const idCliente = Number(
        req.params.id
      );

      if (
        !Number.isInteger(idCliente) ||
        idCliente <= 0
      ) {
        return res.status(400).json({
          ok: false,
          message:
            "El ID del cliente no es válido",
        });
      }

      const cliente =
        await ClienteHistorialModel
          .obtenerCliente(idCliente);

      if (!cliente) {
        return res.status(404).json({
          ok: false,
          message:
            "Cliente no encontrado",
        });
      }

      const [
        resumen,
        equipos,
        reparaciones,
        pagos,
        fotos,
      ] = await Promise.all([
        ClienteHistorialModel
          .obtenerResumen(idCliente),

        ClienteHistorialModel
          .obtenerEquipos(idCliente),

        ClienteHistorialModel
          .obtenerReparaciones(idCliente),

        ClienteHistorialModel
          .obtenerPagos(idCliente),

        ClienteHistorialModel
          .obtenerFotos(idCliente),
      ]);

      return res.json({
        ok: true,
        data: {
          cliente,
          resumen,
          equipos,
          reparaciones,
          pagos,
          fotos,
        },
      });
    } catch (error) {
      console.error(
        "Error obteniendo historial del cliente:",
        error
      );

      return res.status(500).json({
        ok: false,
        message:
          "No se pudo obtener el historial del cliente",
      });
    }
  }
}

module.exports = ClienteHistorialController;
