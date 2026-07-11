const ReparacionModel = require("../models/reparacion.model");

class ReparacionController {
  static async obtenerTodos(req, res) {
    try {
      const reparaciones = await ReparacionModel.obtenerTodos();

      return res.json({
        ok: true,
        total: reparaciones.length,
        data: reparaciones,
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        message: "No se pudieron obtener las reparaciones",
        error: error.message,
      });
    }
  }

  static async obtenerPorId(req, res) {
    try {
      const reparacion = await ReparacionModel.obtenerPorId(
        Number(req.params.id)
      );

      if (!reparacion) {
        return res.status(404).json({
          ok: false,
          message: "Reparación no encontrada",
        });
      }

      return res.json({
        ok: true,
        data: reparacion,
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        message: "No se pudo obtener la reparación",
        error: error.message,
      });
    }
  }

  static async obtenerPorCodigo(req, res) {
    try {
      const reparacion = await ReparacionModel.obtenerPorCodigo(
        req.params.codigo
      );

      if (!reparacion) {
        return res.status(404).json({
          ok: false,
          message: "Código de reparación no encontrado",
        });
      }

      const historial = await ReparacionModel.obtenerHistorial(
        reparacion.IDREPARACION
      );

      return res.json({
        ok: true,
        data: {
          reparacion,
          historial,
        },
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        message: "No se pudo consultar la reparación",
        error: error.message,
      });
    }
  }

  static async crear(req, res) {
    try {
      const { idEquipo, fallaReportada } = req.body;

      if (!idEquipo || !fallaReportada) {
        return res.status(400).json({
          ok: false,
          message:
            "El equipo y la falla reportada son obligatorios",
        });
      }

      const reparacion = await ReparacionModel.crear(req.body);

      return res.status(201).json({
        ok: true,
        message: "Reparación registrada correctamente",
        data: reparacion,
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        message: "No se pudo registrar la reparación",
        error: error.message,
      });
    }
  }

  static async actualizar(req, res) {
    try {
      const actualizado = await ReparacionModel.actualizar(
        Number(req.params.id),
        req.body
      );

      if (!actualizado) {
        return res.status(404).json({
          ok: false,
          message: "Reparación no encontrada",
        });
      }

      return res.json({
        ok: true,
        message: "Reparación actualizada correctamente",
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        message: "No se pudo actualizar la reparación",
        error: error.message,
      });
    }
  }

  static async cambiarEstado(req, res) {
    try {
      const { idEstado } = req.body;

      if (!idEstado) {
        return res.status(400).json({
          ok: false,
          message: "El estado es obligatorio",
        });
      }

      const actualizado = await ReparacionModel.cambiarEstado(
        Number(req.params.id),
        req.body
      );

      if (!actualizado) {
        return res.status(404).json({
          ok: false,
          message: "Reparación no encontrada",
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

  static async obtenerHistorial(req, res) {
    try {
      const historial = await ReparacionModel.obtenerHistorial(
        Number(req.params.id)
      );

      return res.json({
        ok: true,
        data: historial,
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        message: "No se pudo obtener el historial",
        error: error.message,
      });
    }
  }

  static async obtenerEstados(req, res) {
    try {
      const estados = await ReparacionModel.obtenerEstados();

      return res.json({
        ok: true,
        data: estados,
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        message: "No se pudieron obtener los estados",
        error: error.message,
      });
    }
  }
}

module.exports = ReparacionController;