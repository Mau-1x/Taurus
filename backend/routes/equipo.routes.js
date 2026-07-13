const express = require("express");

const EquipoController = require(
  "../controllers/equipo.controller"
);

const {
  verificarToken,
  permitirRoles,
} = require("../middlewares/auth.middleware");

const upload = require(
  "../middlewares/upload.middleware"
);

const router = express.Router();

router.use(
  verificarToken,
  permitirRoles("ADMINISTRADOR", "TECNICO")
);

router.get("/marcas", EquipoController.obtenerMarcas);

router.get(
  "/modelos/marca/:idMarca",
  EquipoController.obtenerModelosPorMarca
);

router.get("/", EquipoController.obtenerTodos);

router.get(
  "/cliente/:idCliente",
  EquipoController.obtenerPorCliente
);

router.get(
  "/:id/fotos",
  EquipoController.obtenerFotos
);

router.post(
  "/:id/fotos",
  upload.single("foto"),
  EquipoController.subirFoto
);

router.delete(
  "/:id/fotos/:idFoto",
  EquipoController.eliminarFoto
);

router.get("/:id", EquipoController.obtenerPorId);

router.post("/", EquipoController.crear);

router.put("/:id", EquipoController.actualizar);

router.delete("/:id", EquipoController.eliminar);

module.exports = router;