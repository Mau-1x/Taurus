const ClienteModel = require("../models/cliente.model");

class ClienteController {
  static async obtenerTodos(req, res) {
    try {
      const clientes = await ClienteModel.obtenerTodos();

      return res.status(200).json({
        ok: true,
        total: clientes.length,
        data: clientes,
      });
    } catch (error) {
      console.error("Error al obtener clientes:", error);

      return res.status(500).json({
        ok: false,
        message: "No se pudieron obtener los clientes",
        error: error.message,
      });
    }
  }
  static async crear(req, res) {
  try {
    const {
      dni,
      nombres,
      apellidoPaterno,
      apellidoMaterno,
      celular,
      email,
      direccion,
    } = req.body;

    if (!dni || !nombres || !apellidoPaterno || !celular) {
      return res.status(400).json({
        ok: false,
        message:
          "DNI, nombres, apellido paterno y celular son obligatorios",
      });
    }

    if (!/^\d{8}$/.test(dni)) {
      return res.status(400).json({
        ok: false,
        message: "El DNI debe contener exactamente 8 números",
      });
    }

    const cliente = await ClienteModel.crear({
      dni,
      nombres,
      apellidoPaterno,
      apellidoMaterno,
      celular,
      email,
      direccion,
    });

    return res.status(201).json({
      ok: true,
      message: "Cliente registrado correctamente",
      data: cliente,
    });
  } catch (error) {
    console.error("Error al registrar cliente:", error);

    if (
      error.number === 2627 ||
      error.number === 2601
    ) {
      return res.status(409).json({
        ok: false,
        message: "Ya existe una persona registrada con ese DNI",
      });
    }

    return res.status(500).json({
      ok: false,
      message: "No se pudo registrar el cliente",
      error: error.message,
    });
  }
}
static async actualizar(req, res) {
  try {
    const idCliente = Number(req.params.id);

    if (!Number.isInteger(idCliente) || idCliente <= 0) {
      return res.status(400).json({
        ok: false,
        message: "El ID del cliente no es válido",
      });
    }

    const {
      dni,
      nombres,
      apellidoPaterno,
      apellidoMaterno,
      celular,
      email,
      direccion,
    } = req.body;

    if (!dni || !nombres || !apellidoPaterno || !celular) {
      return res.status(400).json({
        ok: false,
        message:
          "DNI, nombres, apellido paterno y celular son obligatorios",
      });
    }

    if (!/^\d{8}$/.test(dni)) {
      return res.status(400).json({
        ok: false,
        message: "El DNI debe contener exactamente 8 números",
      });
    }

    const cliente = await ClienteModel.actualizar(idCliente, {
      dni,
      nombres,
      apellidoPaterno,
      apellidoMaterno,
      celular,
      email,
      direccion,
    });

    if (!cliente) {
      return res.status(404).json({
        ok: false,
        message: "Cliente no encontrado",
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Cliente actualizado correctamente",
      data: cliente,
    });
  } catch (error) {
    console.error("Error al actualizar cliente:", error);

    if (error.number === 2627 || error.number === 2601) {
      return res.status(409).json({
        ok: false,
        message: "Ya existe otra persona registrada con ese DNI",
      });
    }

    return res.status(500).json({
      ok: false,
      message: "No se pudo actualizar el cliente",
      error: error.message,
    });
  }
}
static async obtenerPorId(req, res) {
  try {
    const idCliente = Number(req.params.id);

    if (!Number.isInteger(idCliente) || idCliente <= 0) {
      return res.status(400).json({
        ok: false,
        message: "El ID del cliente no es válido",
      });
    }

    const cliente = await ClienteModel.obtenerPorId(idCliente);

    if (!cliente) {
      return res.status(404).json({
        ok: false,
        message: "Cliente no encontrado",
      });
    }

    return res.status(200).json({
      ok: true,
      data: cliente,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "No se pudo obtener el cliente",
      error: error.message,
    });
  }
}

static async obtenerPorDni(req, res) {
  try {
    const { dni } = req.params;

    if (!/^\d{8}$/.test(dni)) {
      return res.status(400).json({
        ok: false,
        message: "El DNI debe contener exactamente 8 números",
      });
    }

    const cliente = await ClienteModel.obtenerPorDni(dni);

    if (!cliente) {
      return res.status(404).json({
        ok: false,
        message: "Cliente no encontrado",
      });
    }

    return res.status(200).json({
      ok: true,
      data: cliente,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "No se pudo buscar el cliente",
      error: error.message,
    });
  }
}

static async eliminar(req, res) {
  try {
    const idCliente = Number(req.params.id);

    if (!Number.isInteger(idCliente) || idCliente <= 0) {
      return res.status(400).json({
        ok: false,
        message: "El ID del cliente no es válido",
      });
    }

    const eliminado = await ClienteModel.eliminar(idCliente);

    if (!eliminado) {
      return res.status(404).json({
        ok: false,
        message: "Cliente no encontrado",
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Cliente eliminado correctamente",
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "No se pudo eliminar el cliente",
      error: error.message,
    });
  }
}
}

module.exports = ClienteController;