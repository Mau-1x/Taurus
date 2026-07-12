const express = require("express");

const ReporteController = require(
  "../controllers/reporte.controller"
);

const {
  verificarToken,
  permitirRoles,
} = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(verificarToken);

router.get(
  "/reparaciones/:id/pdf",
  permitirRoles("ADMINISTRADOR", "TECNICO"),
  ReporteController.descargarComprobanteReparacion
);

router.get(
  "/",
  permitirRoles("ADMINISTRADOR"),
  ReporteController.obtenerReporteGeneral
);

module.exports = router;