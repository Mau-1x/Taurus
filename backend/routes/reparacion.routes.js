const express = require("express");
const ReparacionController = require(
  "../controllers/reparacion.controller"
);

const {
  verificarToken,
} = require("../middlewares/auth.middleware");

const router = express.Router();

// Públicas
router.get(
  "/codigo/:codigo",
  ReparacionController.obtenerPorCodigo
);

// Administrativas
router.get(
  "/estados",
  verificarToken,
  ReparacionController.obtenerEstados
);

router.get(
  "/:id/historial",
  verificarToken,
  ReparacionController.obtenerHistorial
);

router.get(
  "/",
  verificarToken,
  ReparacionController.obtenerTodos
);

router.get(
  "/:id",
  verificarToken,
  ReparacionController.obtenerPorId
);

router.post(
  "/",
  verificarToken,
  ReparacionController.crear
);

router.put(
  "/:id",
  verificarToken,
  ReparacionController.actualizar
);

router.patch(
  "/:id/estado",
  verificarToken,
  ReparacionController.cambiarEstado
);

module.exports = router;