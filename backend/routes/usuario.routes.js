const express = require("express");

const UsuarioController = require(
  "../controllers/usuario.controller"
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

router.get("/roles", UsuarioController.obtenerRoles);
router.get("/", UsuarioController.obtenerTodos);
router.post("/", UsuarioController.crear);
router.put("/:id", UsuarioController.actualizar);
router.patch("/:id/estado", UsuarioController.cambiarEstado);

module.exports = router;