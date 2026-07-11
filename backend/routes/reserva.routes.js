const express = require("express");
const ReservaController = require(
  "../controllers/reserva.controller"
);

const {
  verificarToken,
} = require("../middlewares/auth.middleware");

const router = express.Router();

// Pública
router.post("/", ReservaController.crear);

// Administrativas
router.get(
  "/",
  verificarToken,
  ReservaController.obtenerTodas
);

router.get(
  "/:id",
  verificarToken,
  ReservaController.obtenerPorId
);

router.put(
  "/:id",
  verificarToken,
  ReservaController.actualizar
);

router.patch(
  "/:id/estado",
  verificarToken,
  ReservaController.cambiarEstado
);

router.delete(
  "/:id",
  verificarToken,
  ReservaController.eliminar
);

module.exports = router;