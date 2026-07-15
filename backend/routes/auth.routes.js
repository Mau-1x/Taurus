const express = require("express");

const AuthController = require(
  "../controllers/auth.controller"
);

const {
  verificarToken,
  permitirRoles,
} = require(
  "../middlewares/auth.middleware"
);

const {
  loginLimiter,
  operacionSensibleLimiter,
} = require(
  "../middlewares/rateLimit.middleware"
);

const router = express.Router();

router.post(
  "/registro-admin",
  operacionSensibleLimiter,
  verificarToken,
  permitirRoles("ADMINISTRADOR"),
  AuthController.registrarAdministrador
);

router.post(
  "/login",
  loginLimiter,
  AuthController.iniciarSesion
);

router.get(
  "/perfil",
  verificarToken,
  AuthController.obtenerPerfil
);

router.patch(
  "/cambiar-password",
  operacionSensibleLimiter,
  verificarToken,
  AuthController.cambiarPassword
);

router.get(
  "/solo-admin",
  verificarToken,
  permitirRoles("ADMINISTRADOR"),
  (req, res) => {
    return res.json({
      ok: true,
      message: "Acceso autorizado",
    });
  }
);

module.exports = router;
