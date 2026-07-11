const express = require("express");

const ReservaController = require(
  "../controllers/reserva.controller"
);

const router = express.Router();

router.get("/", ReservaController.obtenerTodas);
router.get("/:id", ReservaController.obtenerPorId);
router.post("/", ReservaController.crear);
router.put("/:id", ReservaController.actualizar);
router.patch("/:id/estado", ReservaController.cambiarEstado);
router.delete("/:id", ReservaController.eliminar);

module.exports = router;