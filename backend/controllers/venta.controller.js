const VentaModel = require("../models/venta.model");

class VentaController {
  static async obtenerTodas(req, res) {
    try {
      const ventas = await VentaModel.obtenerTodas();

      return res.json({
        ok: true,
        total: ventas.length,
        data: ventas,
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        message: "No se pudieron obtener las ventas",
        error: error.message,
      });
    }
  }

  static async obtenerPorId(req, res) {
    try {
      const venta = await VentaModel.obtenerPorId(
        Number(req.params.id)
      );

      if (!venta) {
        return res.status(404).json({
          ok: false,
          message: "Venta no encontrada",
        });
      }

      return res.json({
        ok: true,
        data: venta,
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        message: "No se pudo obtener la venta",
        error: error.message,
      });
    }
  }

  static async crear(req, res) {
    try {
      const {
        productos,
        metodoPago,
      } = req.body;

      if (
        !Array.isArray(productos) ||
        productos.length === 0
      ) {
        return res.status(400).json({
          ok: false,
          message:
            "Debes agregar al menos un producto",
        });
      }

      if (
        ![
          "EFECTIVO",
          "YAPE",
          "PLIN",
          "TARJETA",
          "TRANSFERENCIA",
        ].includes(metodoPago)
      ) {
        return res.status(400).json({
          ok: false,
          message: "Método de pago inválido",
        });
      }

      const descuento = Number(req.body.descuento || 0);

      if (
        !Number.isFinite(descuento) ||
        descuento < 0 ||
        descuento > 99999999.99
      ) {
        return res.status(400).json({
          ok: false,
          message: "El descuento no es válido",
        });
      }

      if (
        req.body.observaciones &&
        req.body.observaciones.trim().length > 500
      ) {
        return res.status(400).json({
          ok: false,
          message:
            "Las observaciones no pueden superar los 500 caracteres",
        });
      }

      if (
        req.body.idCliente !== null &&
        req.body.idCliente !== "" &&
        req.body.idCliente !== undefined &&
        (!Number.isInteger(Number(req.body.idCliente)) ||
          Number(req.body.idCliente) <= 0)
      ) {
        return res.status(400).json({
          ok: false,
          message: "El cliente seleccionado no es válido",
        });
      }

      for (const item of productos) {
        if (
          !item.idProducto ||
          !Number.isInteger(Number(item.cantidad)) ||
          Number(item.cantidad) <= 0
        ) {
          return res.status(400).json({
            ok: false,
            message:
              "Los productos de la venta son inválidos",
          });
        }
      }

      const idsProductos = productos.map((item) =>
        Number(item.idProducto)
      );

      const productosUnicos = new Set(idsProductos);

      if (productosUnicos.size !== idsProductos.length) {
        return res.status(400).json({
          ok: false,
          message:
            "No puedes enviar productos repetidos en la misma venta",
        });
      }

      const clienteValido =
        await VentaModel.clienteExiste(
          req.body.idCliente
            ? Number(req.body.idCliente)
            : null
        );

      if (!clienteValido) {
        return res.status(404).json({
          ok: false,
          message: "El cliente seleccionado no existe",
        });
      }

      const venta = await VentaModel.crear({
        idCliente: req.body.idCliente
          ? Number(req.body.idCliente)
          : null,
        metodoPago,
        descuento,
        observaciones:
          req.body.observaciones?.trim() || null,
        productos: productos.map((item) => ({
          idProducto: Number(item.idProducto),
          cantidad: Number(item.cantidad),
        })),
      });

      return res.status(201).json({
        ok: true,
        message: "Venta registrada correctamente",
        data: venta,
      });
    } catch (error) {
      return res.status(400).json({
        ok: false,
        message:
          error.message ||
          "No se pudo registrar la venta",
      });
    }
  }

  static async anular(req, res) {
    try {
      const idVenta = Number(req.params.id);

      if (
        !Number.isInteger(idVenta) ||
        idVenta <= 0
      ) {
        return res.status(400).json({
          ok: false,
          message: "El ID de la venta no es válido",
        });
      }

      const resultado = await VentaModel.anular(idVenta);

      if (!resultado) {
        return res.status(404).json({
          ok: false,
          message: "Venta no encontrada",
        });
      }

      return res.json({
        ok: true,
        message:
          "Venta anulada y stock devuelto correctamente",
      });
    } catch (error) {
      return res.status(400).json({
        ok: false,
        message:
          error.message ||
          "No se pudo anular la venta",
      });
    }
  }
}

module.exports = VentaController;