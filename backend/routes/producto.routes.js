const express = require("express");
const ProductoController = require(
  "../controllers/producto.controller"
);

const {
  verificarToken,
} = require("../middlewares/auth.middleware");

const router = express.Router();

// Públicas
router.get(
  "/categorias",
  ProductoController.obtenerCategorias
);

router.get("/", ProductoController.obtenerTodos);

// Administrativas
router.get(
  "/:id/movimientos",
  verificarToken,
  ProductoController.obtenerMovimientos
);

router.post(
  "/",
  verificarToken,
  ProductoController.crear
);

router.put(
  "/:id",
  verificarToken,
  ProductoController.actualizar
);

router.delete(
  "/:id",
  verificarToken,
  ProductoController.eliminar
);

router.patch(
  "/:id/stock",
  verificarToken,
  ProductoController.moverStock
);

module.exports = router;