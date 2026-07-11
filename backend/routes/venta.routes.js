const express = require("express");

const VentaController = require(
  "../controllers/venta.controller"
);

const router = express.Router();

router.get("/", VentaController.obtenerTodas);
router.get("/:id", VentaController.obtenerPorId);
router.post("/", VentaController.crear);
router.patch("/:id/anular", VentaController.anular);

module.exports = router;