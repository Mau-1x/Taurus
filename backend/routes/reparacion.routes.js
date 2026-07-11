const express = require("express");
const ReparacionController = require(
  "../controllers/reparacion.controller"
);

const router = express.Router();

router.get("/estados", ReparacionController.obtenerEstados);
router.get(
  "/codigo/:codigo",
  ReparacionController.obtenerPorCodigo
);
router.get(
  "/:id/historial",
  ReparacionController.obtenerHistorial
);

router.get("/", ReparacionController.obtenerTodos);
router.get("/:id", ReparacionController.obtenerPorId);
router.post("/", ReparacionController.crear);
router.put("/:id", ReparacionController.actualizar);
router.patch(
  "/:id/estado",
  ReparacionController.cambiarEstado
);

module.exports = router;