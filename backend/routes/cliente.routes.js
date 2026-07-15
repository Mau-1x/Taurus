const express = require("express");

const ClienteController = require(
  "../controllers/cliente.controller"
);

const ClienteHistorialController = require(
  "../controllers/clienteHistorial.controller"
);

const {
  verificarToken,
  permitirRoles,
} = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(
  verificarToken,
  permitirRoles(
    "ADMINISTRADOR",
    "VENDEDOR"
  )
);

router.get(
  "/",
  ClienteController.obtenerTodos
);

router.get(
  "/dni/:dni",
  ClienteController.obtenerPorDni
);

router.get(
  "/:id/historial",
  ClienteHistorialController.obtenerHistorial
);

router.get(
  "/:id",
  ClienteController.obtenerPorId
);

router.post(
  "/",
  ClienteController.crear
);

router.put(
  "/:id",
  ClienteController.actualizar
);

router.delete(
  "/:id",
  ClienteController.eliminar
);

module.exports = router;
