const express = require("express");

const ReparacionController = require(
  "../controllers/reparacion.controller"
);

const {
  verificarToken,
  permitirRoles,
} = require("../middlewares/auth.middleware");

const router = express.Router();

// Ruta pública
router.get(
  "/codigo/:codigo",
  ReparacionController.obtenerPorCodigo
);

// Desde aquí todo requiere autenticación y rol
router.use(
  verificarToken,
  permitirRoles("ADMINISTRADOR", "TECNICO")
);

router.get(
  "/estados",
  ReparacionController.obtenerEstados
);

router.get(
  "/:id/historial",
  ReparacionController.obtenerHistorial
);

router.get(
  "/",
  ReparacionController.obtenerTodos
);

router.get(
  "/:id",
  ReparacionController.obtenerPorId
);

router.post(
  "/",
  ReparacionController.crear
);

router.put(
  "/:id",
  ReparacionController.actualizar
);

router.patch(
  "/:id/estado",
  ReparacionController.cambiarEstado
);

module.exports = router;