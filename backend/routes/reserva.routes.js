const express = require("express");

const ReservaController = require(
  "../controllers/reserva.controller"
);

const {
  verificarToken,
  permitirRoles,
} = require("../middlewares/auth.middleware");

const router = express.Router();

// Ruta pública
router.post("/", ReservaController.crear);

// Desde aquí requiere sesión y rol
router.use(
  verificarToken,
  permitirRoles(
    "ADMINISTRADOR",
    "TECNICO",
    "VENDEDOR"
  )
);

router.get("/", ReservaController.obtenerTodas);

router.get("/:id", ReservaController.obtenerPorId);

router.put("/:id", ReservaController.actualizar);

router.patch(
  "/:id/estado",
  ReservaController.cambiarEstado
);

router.delete("/:id", ReservaController.eliminar);

module.exports = router;