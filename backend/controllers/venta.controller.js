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

      const venta = await VentaModel.crear({
        ...req.body,
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
      const resultado = await VentaModel.anular(
        Number(req.params.id)
      );

      if (!resultado) {
        return res.status(404).json({
          ok: false,
          message: "Venta no encontrada",
        });
      }

      return res.json({
        ok: true,
        message: "Venta anulada correctamente",
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