const express = require("express");

const ProductoController = require(
  "../controllers/producto.controller"
);

const {
  verificarToken,
  permitirRoles,
} = require("../middlewares/auth.middleware");

const router = express.Router();

// Rutas públicas
router.get(
  "/categorias",
  ProductoController.obtenerCategorias
);

router.get(
  "/",
  ProductoController.obtenerTodos
);

// Desde aquí todo requiere sesión y rol
router.use(
  verificarToken,
  permitirRoles(
    "ADMINISTRADOR",
    "TECNICO",
    "VENDEDOR"
  )
);

router.get(
  "/:id/movimientos",
  ProductoController.obtenerMovimientos
);

router.post(
  "/",
  ProductoController.crear
);

router.put(
  "/:id",
  ProductoController.actualizar
);

router.delete(
  "/:id",
  ProductoController.eliminar
);

router.patch(
  "/:id/stock",
  ProductoController.moverStock
);

module.exports = router;