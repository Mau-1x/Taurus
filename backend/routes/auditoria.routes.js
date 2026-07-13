const express = require("express");

const AuditoriaController = require(
  "../controllers/auditoria.controller"
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
  AuditoriaController.obtenerTodos
);

module.exports = router;