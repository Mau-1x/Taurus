const express = require("express");

const ProductoController = require(
  "../controllers/producto.controller"
);

const {
  verificarToken,
  permitirRoles,
} = require("../middlewares/auth.middleware");

const router = express.Router();

/* PÚBLICAS: deben ir primero */

router.get(
  "/categorias",
  ProductoController.obtenerCategorias
);

router.get(
  "/marcas",
  ProductoController.obtenerMarcas
);

router.get(
  "/modelos",
  ProductoController.obtenerModelos
);

router.get(
  "/:id/compatibilidades",
  ProductoController.obtenerCompatibilidades
);

router.get(
  "/",
  ProductoController.obtenerTodos
);

/* PROTEGIDAS: deben ir después */

router.use(
  verificarToken,
  permitirRoles(
    "ADMINISTRADOR",
    "TECNICO",
    "VENDEDOR"
  )
);

router.post(
  "/importar-modelos",
  ProductoController.importarModelos
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

router.put(
  "/:id/compatibilidades",
  ProductoController.actualizarCompatibilidades
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