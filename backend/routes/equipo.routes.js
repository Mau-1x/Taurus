const express = require("express");
const EquipoController = require("../controllers/equipo.controller");

const router = express.Router();

router.get("/marcas", EquipoController.obtenerMarcas);
router.get(
  "/modelos/marca/:idMarca",
  EquipoController.obtenerModelosPorMarca
);
router.get("/cliente/:idCliente", EquipoController.obtenerPorCliente);

router.get("/", EquipoController.obtenerTodos);
router.get("/:id", EquipoController.obtenerPorId);
router.post("/", EquipoController.crear);
router.put("/:id", EquipoController.actualizar);
router.delete("/:id", EquipoController.eliminar);

module.exports = router;