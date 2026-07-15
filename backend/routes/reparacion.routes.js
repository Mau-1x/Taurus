const express = require("express");

const ReparacionController = require(
  "../controllers/reparacion.controller"
);

const GarantiaController = require(
  "../controllers/garantia.controller"
);

const GaleriaPublicaController = require(
  "../controllers/galeriaPublica.controller"
);

const {
  verificarToken,
  permitirRoles,
} = require(
  "../middlewares/auth.middleware"
);

const {
  seguimientoLimiter,
  subidaImagenLimiter,
} = require(
  "../middlewares/rateLimit.middleware"
);

const {
  upload,
  validarImagenReal,
} = require(
  "../middlewares/upload.middleware"
);

const router = express.Router();

/*
 * Rutas públicas.
 */
router.get(
  "/galeria-publica",
  GaleriaPublicaController.obtenerGaleria
);

router.post(
  "/seguimiento",
  seguimientoLimiter,
  ReparacionController.consultarSeguimiento
);

/*
 * Desde aquí todo requiere autenticación.
 */
router.use(
  verificarToken,
  permitirRoles(
    "ADMINISTRADOR",
    "TECNICO"
  )
);

/*
 * Garantías.
 * Estas rutas deben ir antes de la ruta genérica /:id.
 */
router.get(
  "/garantias",
  GarantiaController.obtenerPanel
);

router.get(
  "/garantias/:idGarantia/historial",
  GarantiaController.obtenerHistorial
);

router.patch(
  "/garantias/:idGarantia",
  GarantiaController.actualizarReclamo
);

router.post(
  "/:id/garantias",
  GarantiaController.crearReclamo
);

router.get(
  "/estados",
  ReparacionController.obtenerEstados
);

router.get(
  "/:id/historial",
  ReparacionController.obtenerHistorial
);

router.get(
  "/:id/fotos",
  ReparacionController.obtenerFotos
);

router.post(
  "/:id/fotos",
  subidaImagenLimiter,
  upload.single("foto"),
  validarImagenReal,
  ReparacionController.subirFoto
);

router.patch(
  "/:id/fotos/:idFoto",
  ReparacionController.actualizarFoto
);

router.delete(
  "/:id/fotos/:idFoto",
  ReparacionController.eliminarFoto
);

router.get(
  "/:id/repuestos",
  ReparacionController.obtenerRepuestos
);

router.post(
  "/:id/repuestos",
  ReparacionController.agregarRepuesto
);

router.delete(
  "/:id/repuestos/:idProducto",
  ReparacionController.quitarRepuesto
);

router.get(
  "/:id/pagos",
  ReparacionController.obtenerPagos
);

router.post(
  "/:id/pagos",
  ReparacionController.registrarPago
);

router.delete(
  "/:id/pagos/:idPago",
  ReparacionController.anularPago
);

router.get(
  "/",
  ReparacionController.obtenerTodos
);

router.get(
  "/:id",
  ReparacionController.obtenerPorId
);

router.post(
  "/",
  ReparacionController.crear
);

router.put(
  "/:id",
  ReparacionController.actualizar
);

router.patch(
  "/:id/estado",
  ReparacionController.cambiarEstado
);

module.exports = router;
