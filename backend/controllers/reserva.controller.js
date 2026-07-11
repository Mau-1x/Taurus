const ReservaModel = require("../models/reserva.model");

class ReservaController {
  static async obtenerTodas(req, res) {
    try {
      const reservas = await ReservaModel.obtenerTodas();

      return res.json({
        ok: true,
        total: reservas.length,
        data: reservas,
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        message: "No se pudieron obtener las reservas",
        error: error.message,
      });
    }
  }

  static async obtenerPorId(req, res) {
    try {
      const reserva = await ReservaModel.obtenerPorId(
        Number(req.params.id)
      );

      if (!reserva) {
        return res.status(404).json({
          ok: false,
          message: "Reserva no encontrada",
        });
      }

      return res.json({
        ok: true,
        data: reserva,
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        message: "No se pudo obtener la reserva",
        error: error.message,
      });
    }
  }

  

  static async crear(req, res) {
    try {
      const {
        nombreCliente,
        celular,
        servicio,
        fechaReserva,
        horaReserva,
      } = req.body;
      
      const fechaSeleccionada = new Date(
        `${fechaReserva}T${horaReserva}`
      );

      if (Number.isNaN(fechaSeleccionada.getTime())) {
        return res.status(400).json({
          ok: false,
          message: "La fecha u hora no es válida",
        });
      }

      if (fechaSeleccionada < new Date()) {
        return res.status(400).json({
          ok: false,
          message: "No puedes reservar una fecha pasada",
        });
      }
      const hora = horaReserva.substring(0, 5);

      if (hora < "10:00" || hora > "21:00") {
        return res.status(400).json({
          ok: false,
          message:
            "El horario de atención es de 10:00 a. m. a 9:00 p. m.",
        });
      }
      
      if (
        !nombreCliente ||
        !celular ||
        !servicio ||
        !fechaReserva ||
        !horaReserva
      ) {
        return res.status(400).json({
          ok: false,
          message: "Completa los campos obligatorios",
        });
      }

      const reserva = await ReservaModel.crear(req.body);

      return res.status(201).json({
        ok: true,
        message: "Reserva registrada correctamente",
        data: reserva,
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        message: "No se pudo registrar la reserva",
        error: error.message,
      });
    }
  }

  static async actualizar(req, res) {
    try {
      const actualizado = await ReservaModel.actualizar(
        Number(req.params.id),
        req.body
      );

      if (!actualizado) {
        return res.status(404).json({
          ok: false,
          message: "Reserva no encontrada",
        });
      }

      return res.json({
        ok: true,
        message: "Reserva actualizada correctamente",
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        message: "No se pudo actualizar la reserva",
        error: error.message,
      });
    }
  }

  static async cambiarEstado(req, res) {
    try {
      const estadosValidos = [
        "PENDIENTE",
        "CONFIRMADA",
        "ATENDIDA",
        "CANCELADA",
      ];

      const { estado } = req.body;

      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({
          ok: false,
          message: "Estado inválido",
        });
      }

      const actualizado = await ReservaModel.cambiarEstado(
        Number(req.params.id),
        estado
      );

      if (!actualizado) {
        return res.status(404).json({
          ok: false,
          message: "Reserva no encontrada",
        });
      }

      return res.json({
        ok: true,
        message: "Estado actualizado correctamente",
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        message: "No se pudo cambiar el estado",
        error: error.message,
      });
    }
  }

  static async eliminar(req, res) {
    try {
      const eliminado = await ReservaModel.eliminar(
        Number(req.params.id)
      );

      if (!eliminado) {
        return res.status(404).json({
          ok: false,
          message: "Reserva no encontrada",
        });
      }

      return res.json({
        ok: true,
        message: "Reserva eliminada correctamente",
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        message: "No se pudo eliminar la reserva",
        error: error.message,
      });
    }
  }
}

module.exports = ReservaController;