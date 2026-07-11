const EquipoModel = require("../models/equipo.model");

class EquipoController {
  static async obtenerTodos(req, res) {
    try {
      const equipos = await EquipoModel.obtenerTodos();

      return res.json({
        ok: true,
        total: equipos.length,
        data: equipos,
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        message: "No se pudieron obtener los equipos",
        error: error.message,
      });
    }
  }

  static async obtenerPorId(req, res) {
    try {
      const idEquipo = Number(req.params.id);
      const equipo = await EquipoModel.obtenerPorId(idEquipo);

      if (!equipo) {
        return res.status(404).json({
          ok: false,
          message: "Equipo no encontrado",
        });
      }

      return res.json({
        ok: true,
        data: equipo,
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        message: "No se pudo obtener el equipo",
        error: error.message,
      });
    }
  }

  static async obtenerPorCliente(req, res) {
    try {
      const idCliente = Number(req.params.idCliente);
      const equipos = await EquipoModel.obtenerPorCliente(idCliente);

      return res.json({
        ok: true,
        total: equipos.length,
        data: equipos,
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        message: "No se pudieron obtener los equipos del cliente",
        error: error.message,
      });
    }
  }

  static async crear(req, res) {
    try {
      const { idCliente, idModelo } = req.body;

      if (!idCliente || !idModelo) {
        return res.status(400).json({
          ok: false,
          message: "El cliente y el modelo son obligatorios",
        });
      }

      const equipo = await EquipoModel.crear(req.body);

      return res.status(201).json({
        ok: true,
        message: "Equipo registrado correctamente",
        data: equipo,
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        message: "No se pudo registrar el equipo",
        error: error.message,
      });
    }
  }

  static async actualizar(req, res) {
    try {
      const idEquipo = Number(req.params.id);
      const { idCliente, idModelo } = req.body;

      if (!idCliente || !idModelo) {
        return res.status(400).json({
          ok: false,
          message: "El cliente y el modelo son obligatorios",
        });
      }

      const actualizado = await EquipoModel.actualizar(
        idEquipo,
        req.body
      );

      if (!actualizado) {
        return res.status(404).json({
          ok: false,
          message: "Equipo no encontrado",
        });
      }

      return res.json({
        ok: true,
        message: "Equipo actualizado correctamente",
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        message: "No se pudo actualizar el equipo",
        error: error.message,
      });
    }
  }

  static async eliminar(req, res) {
    try {
      const idEquipo = Number(req.params.id);
      const eliminado = await EquipoModel.eliminar(idEquipo);

      if (!eliminado) {
        return res.status(404).json({
          ok: false,
          message: "Equipo no encontrado",
        });
      }

      return res.json({
        ok: true,
        message: "Equipo eliminado correctamente",
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        message: "No se pudo eliminar el equipo",
        error: error.message,
      });
    }
  }

  static async obtenerMarcas(req, res) {
    try {
      const marcas = await EquipoModel.obtenerMarcas();

      return res.json({
        ok: true,
        data: marcas,
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        message: "No se pudieron obtener las marcas",
        error: error.message,
      });
    }
  }

  static async obtenerModelosPorMarca(req, res) {
    try {
      const idMarca = Number(req.params.idMarca);
      const modelos =
        await EquipoModel.obtenerModelosPorMarca(idMarca);

      return res.json({
        ok: true,
        data: modelos,
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        message: "No se pudieron obtener los modelos",
        error: error.message,
      });
    }
  }
}

module.exports = EquipoController;