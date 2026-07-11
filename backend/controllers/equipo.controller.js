const EquipoModel = require("../models/equipo.model");

function validarEquipo(datos) {
  const {
    idCliente,
    idModelo,
    tipoDispositivo,
    imei,
    numeroSerie,
    color,
    observaciones,
  } = datos;

  if (
    !Number.isInteger(Number(idCliente)) ||
    Number(idCliente) <= 0
  ) {
    return "El cliente no es válido";
  }

  if (
    !Number.isInteger(Number(idModelo)) ||
    Number(idModelo) <= 0
  ) {
    return "El modelo no es válido";
  }

  if (
    !["Celular", "Tablet"].includes(tipoDispositivo)
  ) {
    return "El tipo de dispositivo no es válido";
  }

  if (imei && !/^\d{15}$/.test(imei)) {
    return "El IMEI debe contener exactamente 15 números";
  }

  if (numeroSerie && numeroSerie.length > 50) {
    return "El número de serie no puede superar los 50 caracteres";
  }

  if (
    color &&
    !/^[a-zA-ZÁÉÍÓÚáéíóúÑñüÜ\s-]{2,30}$/.test(color)
  ) {
    return "El color debe contener solo letras y tener entre 2 y 30 caracteres";
  }

  if (
    observaciones &&
    observaciones.length > 500
  ) {
    return "Las observaciones no pueden superar los 500 caracteres";
  }

  return null;
}

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
      const errorValidacion = validarEquipo(req.body);

      if (errorValidacion) {
        return res.status(400).json({
          ok: false,
          message: errorValidacion,
        });
      }
      const modeloValido =
        await EquipoModel.validarModeloMarca(
          Number(req.body.idModelo),
          Number(req.body.idMarca)
        );

      if (!modeloValido) {
        return res.status(400).json({
          ok: false,
          message:
            "El modelo seleccionado no pertenece a la marca indicada",
        });
      }
      if (req.body.imei) {
        const equipoExistente =
          await EquipoModel.obtenerPorImei(req.body.imei);

        if (equipoExistente) {
          return res.status(409).json({
            ok: false,
            message:
              "Ya existe un equipo registrado con ese IMEI",
          });
        }
      }

      const equipo = await EquipoModel.crear({
        ...req.body,
        idCliente: Number(req.body.idCliente),
        idModelo: Number(req.body.idModelo),
        imei: req.body.imei?.trim() || null,
        numeroSerie:
          req.body.numeroSerie?.trim() || null,
        color: req.body.color?.trim() || null,
        observaciones:
          req.body.observaciones?.trim() || null,
      });

      return res.status(201).json({
        ok: true,
        message: "Equipo registrado correctamente",
        data: equipo,
      });
    } catch (error) {
      console.error("Error al registrar equipo:", error);

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

      if (
        !Number.isInteger(idEquipo) ||
        idEquipo <= 0
      ) {
        return res.status(400).json({
          ok: false,
          message: "El ID del equipo no es válido",
        });
      }

      const errorValidacion = validarEquipo(req.body);

      if (errorValidacion) {
        return res.status(400).json({
          ok: false,
          message: errorValidacion,
        });
      }

      const modeloValido =
        await EquipoModel.validarModeloMarca(
          Number(req.body.idModelo),
          Number(req.body.idMarca)
        );

      if (!modeloValido) {
        return res.status(400).json({
          ok: false,
          message:
            "El modelo seleccionado no pertenece a la marca indicada",
        });
      }

      const actualizado = await EquipoModel.actualizar(
        idEquipo,
        {
          ...req.body,
          idCliente: Number(req.body.idCliente),
          idModelo: Number(req.body.idModelo),
          imei: req.body.imei?.trim() || null,
          numeroSerie:
            req.body.numeroSerie?.trim() || null,
          color: req.body.color?.trim() || null,
          observaciones:
            req.body.observaciones?.trim() || null,
        }
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
      console.error("Error al actualizar equipo:", error);

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