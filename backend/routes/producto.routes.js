const express = require("express");
const ProductoController = require(
  "../controllers/producto.controller"
);

const router = express.Router();

router.get("/categorias", ProductoController.obtenerCategorias);
router.get("/:id/movimientos", ProductoController.obtenerMovimientos);

router.get("/", ProductoController.obtenerTodos);
router.post("/", ProductoController.crear);
router.put("/:id", ProductoController.actualizar);
router.delete("/:id", ProductoController.eliminar);
router.patch("/:id/stock", ProductoController.moverStock);

module.exports = router;