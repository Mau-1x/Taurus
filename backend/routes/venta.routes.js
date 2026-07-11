const express = require("express");

const VentaController = require(
  "../controllers/venta.controller"
);

const {
  verificarToken,
  permitirRoles,
} = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(
  verificarToken,
  permitirRoles("ADMINISTRADOR", "VENDEDOR")
);

router.get("/", VentaController.obtenerTodas);

router.get("/:id", VentaController.obtenerPorId);

router.post("/", VentaController.crear);

router.patch(
  "/:id/anular",
  VentaController.anular
);

module.exports = router;