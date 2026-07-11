const express = require("express");

const ReporteController = require(
  "../controllers/reporte.controller"
);

const {
  verificarToken,
  permitirRoles,
} = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(
  verificarToken,
  permitirRoles("ADMINISTRADOR")
);

router.get(
  "/",
  ReporteController.obtenerReporteGeneral
);

module.exports = router;