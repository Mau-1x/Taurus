const express = require("express");

const ReporteController = require(
  "../controllers/reporte.controller"
);

const router = express.Router();

router.get("/", ReporteController.obtenerReporteGeneral);

module.exports = router;