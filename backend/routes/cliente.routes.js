const express = require("express");
const ClienteController = require("../controllers/cliente.controller");

const router = express.Router();
const {
  verificarToken,
  permitirRoles,
} = require("../middlewares/auth.middleware");

router.use(
  verificarToken,
  permitirRoles("ADMINISTRADOR", "VENDEDOR")
);

router.get("/", ClienteController.obtenerTodos);
router.get("/dni/:dni", ClienteController.obtenerPorDni);
router.get("/:id", ClienteController.obtenerPorId);

router.post("/", ClienteController.crear);
router.put("/:id", ClienteController.actualizar);
router.delete("/:id", ClienteController.eliminar);

module.exports = router;