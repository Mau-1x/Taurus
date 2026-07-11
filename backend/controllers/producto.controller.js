const ProductoModel = require("../models/producto.model");

class ProductoController {
  static async obtenerTodos(req, res) {
    try {
      const productos = await ProductoModel.obtenerTodos();

      return res.json({
        ok: true,
        total: productos.length,
        data: productos,
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        message: "No se pudieron obtener los productos",
        error: error.message,
      });
    }
  }

  static async obtenerCategorias(req, res) {
    try {
      const categorias = await ProductoModel.obtenerCategorias();

      return res.json({
        ok: true,
        data: categorias,
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        message: "No se pudieron obtener las categorías",
        error: error.message,
      });
    }
  }

  static async crear(req, res) {
    try {
      const { idCategoria, codigo, nombre } = req.body;

      if (!idCategoria || !codigo || !nombre) {
        return res.status(400).json({
          ok: false,
          message: "Categoría, código y nombre son obligatorios",
        });
      }

      const producto = await ProductoModel.crear(req.body);

      return res.status(201).json({
        ok: true,
        message: "Producto registrado correctamente",
        data: producto,
      });
    } catch (error) {
      if (error.number === 2627 || error.number === 2601) {
        return res.status(409).json({
          ok: false,
          message: "Ya existe un producto con ese código",
        });
      }

      return res.status(500).json({
        ok: false,
        message: "No se pudo registrar el producto",
        error: error.message,
      });
    }
  }

  static async actualizar(req, res) {
    try {
      const actualizado = await ProductoModel.actualizar(
        Number(req.params.id),
        req.body
      );

      if (!actualizado) {
        return res.status(404).json({
          ok: false,
          message: "Producto no encontrado",
        });
      }

      return res.json({
        ok: true,
        message: "Producto actualizado correctamente",
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        message: "No se pudo actualizar el producto",
        error: error.message,
      });
    }
  }

  static async eliminar(req, res) {
    try {
      const eliminado = await ProductoModel.eliminar(
        Number(req.params.id)
      );

      if (!eliminado) {
        return res.status(404).json({
          ok: false,
          message: "Producto no encontrado",
        });
      }

      return res.json({
        ok: true,
        message: "Producto eliminado correctamente",
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        message: "No se pudo eliminar el producto",
        error: error.message,
      });
    }
  }

  static async moverStock(req, res) {
    try {
      const { tipo, cantidad } = req.body;

      if (
        !["ENTRADA", "SALIDA", "AJUSTE"].includes(tipo) ||
        !Number.isInteger(Number(cantidad)) ||
        Number(cantidad) < 0
      ) {
        return res.status(400).json({
          ok: false,
          message: "Tipo o cantidad inválida",
        });
      }

      const resultado = await ProductoModel.moverStock(
        Number(req.params.id),
        {
          ...req.body,
          cantidad: Number(cantidad),
        }
      );

      if (!resultado) {
        return res.status(404).json({
          ok: false,
          message: "Producto no encontrado",
        });
      }

      return res.json({
        ok: true,
        message: "Stock actualizado correctamente",
        data: resultado,
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        ok: false,
        message: error.message || "No se pudo actualizar el stock",
      });
    }
  }

  static async obtenerMovimientos(req, res) {
    try {
      const movimientos = await ProductoModel.obtenerMovimientos(
        Number(req.params.id)
      );

      return res.json({
        ok: true,
        data: movimientos,
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        message: "No se pudieron obtener los movimientos",
        error: error.message,
      });
    }
  }
}

module.exports = ProductoController;