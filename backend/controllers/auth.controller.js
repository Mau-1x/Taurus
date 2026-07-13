const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AuthModel = require("../models/auth.model");
const {
  registrarAuditoria,
} = require("../utils/auditoria");

function validarCorreo(correo) {
  return (
    typeof correo === "string" &&
    correo.length <= 150 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(
      correo.trim()
    )
  );
}

class AuthController {
  static async registrarAdministrador(req, res) {
    try {
      const { nombre, correo, password } = req.body;

      if (!nombre || !correo || !password) {
        return res.status(400).json({
          ok: false,
          message: "Nombre, correo y contraseña son obligatorios",
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          ok: false,
          message:
            "La contraseña debe tener al menos 8 caracteres",
        });
      }

      const correoNormalizado = correo.trim().toLowerCase();

      const usuarioExistente =
        await AuthModel.buscarPorCorreo(correoNormalizado);

      if (usuarioExistente) {
        return res.status(409).json({
          ok: false,
          message: "El correo ya está registrado",
        });
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const usuario =
        await AuthModel.crearAdministrador({
          nombre: nombre.trim(),
          correo: correoNormalizado,
          passwordHash,
        });

      return res.status(201).json({
        ok: true,
        message: "Administrador registrado correctamente",
        data: usuario,
      });
    } catch (error) {
      console.error("Error registrando administrador:", error);

      return res.status(500).json({
        ok: false,
        message: "No se pudo registrar el administrador",
        error: error.message,
      });
    }
  }

  static async iniciarSesion(req, res) {
    try {
      const { correo, password } = req.body;

      if (!correo || !password) {
        return res.status(400).json({
          ok: false,
          message: "Correo y contraseña son obligatorios",
        });
      }

      if (!validarCorreo(correo)) {
        return res.status(400).json({
          ok: false,
          message: "El correo electrónico no es válido",
        });
      }

      if (
        typeof password !== "string" ||
        password.length > 72
      ) {
        return res.status(400).json({
          ok: false,
          message: "La contraseña no es válida",
        });
      }

      const correoNormalizado = correo.trim().toLowerCase();

      const usuario =
        await AuthModel.buscarPorCorreo(correoNormalizado);

      if (!usuario) {
        await registrarAuditoria({
          req,
          modulo: "AUTENTICACION",
          accion: "INICIAR_SESION",
          entidad: "USUARIO",
          descripcion:
            "Intento de inicio de sesión con correo no registrado",
          datosNuevos: {
            correo: correoNormalizado,
            resultado: "FALLIDO",
            motivo: "USUARIO_NO_ENCONTRADO",
          },
        });

        return res.status(401).json({
          ok: false,
          message: "Correo o contraseña incorrectos",
        });
      }

      if (!usuario.ESTADO) {
        await registrarAuditoria({
          req,
          idUsuario: usuario.IDUSUARIO,
          modulo: "AUTENTICACION",
          accion: "INICIAR_SESION",
          entidad: "USUARIO",
          identidad: usuario.IDUSUARIO,
          descripcion:
            "Intento de inicio de sesión de un usuario inactivo",
          datosNuevos: {
            correo: usuario.CORREO,
            resultado: "FALLIDO",
            motivo: "USUARIO_INACTIVO",
          },
        });

        return res.status(403).json({
          ok: false,
          message: "El usuario se encuentra inactivo",
        });
      }

      const passwordCorrecta = await bcrypt.compare(
        password,
        usuario.PASSWORD_HASH
      );

      if (!passwordCorrecta) {
        await registrarAuditoria({
          req,
          idUsuario: usuario.IDUSUARIO,
          modulo: "AUTENTICACION",
          accion: "INICIAR_SESION",
          entidad: "USUARIO",
          identidad: usuario.IDUSUARIO,
          descripcion:
            "Intento de inicio de sesión con contraseña incorrecta",
          datosNuevos: {
            correo: usuario.CORREO,
            resultado: "FALLIDO",
            motivo: "CONTRASENA_INCORRECTA",
          },
        });

        return res.status(401).json({
          ok: false,
          message: "Correo o contraseña incorrectos",
        });
      }

      const token = jwt.sign(
        {
          idUsuario: usuario.IDUSUARIO,
          idRol: usuario.IDROL,
          rol: usuario.ROL,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRES_IN || "8h",
        }
      );

      await AuthModel.actualizarUltimoAcceso(
        usuario.IDUSUARIO
      );

      await registrarAuditoria({
        req,
        idUsuario: usuario.IDUSUARIO,
        modulo: "AUTENTICACION",
        accion: "INICIAR_SESION",
        entidad: "USUARIO",
        identidad: usuario.IDUSUARIO,
        descripcion:
          "Inicio de sesión realizado correctamente",
        datosNuevos: {
          correo: usuario.CORREO,
          rol: usuario.ROL,
          resultado: "EXITOSO",
        },
      });

      return res.json({
        ok: true,
        message: "Inicio de sesión correcto",
        data: {
          token,
          usuario: {
            idUsuario: usuario.IDUSUARIO,
            nombre: usuario.NOMBRE,
            correo: usuario.CORREO,
            rol: usuario.ROL,
          },
        },
      });
    } catch (error) {
      console.error("Error iniciando sesión:", error);

      return res.status(500).json({
        ok: false,
        message: "No se pudo iniciar sesión",
        error: error.message,
      });
    }
  }

    static async cambiarPassword(req, res) {
    try {
      const {
        passwordActual,
        passwordNueva,
        confirmarPassword,
      } = req.body;

      if (
        !passwordActual ||
        !passwordNueva ||
        !confirmarPassword
      ) {
        return res.status(400).json({
          ok: false,
          message:
            "Completa todos los campos de contraseña",
        });
      }

      if (
        typeof passwordActual !== "string" ||
        typeof passwordNueva !== "string" ||
        typeof confirmarPassword !== "string"
      ) {
        return res.status(400).json({
          ok: false,
          message: "Los datos enviados no son válidos",
        });
      }

      if (
        passwordActual.length > 72 ||
        passwordNueva.length > 72
      ) {
        return res.status(400).json({
          ok: false,
          message: "La contraseña no es válida",
        });
      }

      if (passwordNueva.length < 8) {
        return res.status(400).json({
          ok: false,
          message:
            "La nueva contraseña debe tener al menos 8 caracteres",
        });
      }

      if (
        !/[A-Z]/.test(passwordNueva) ||
        !/[a-z]/.test(passwordNueva) ||
        !/\d/.test(passwordNueva)
      ) {
        return res.status(400).json({
          ok: false,
          message:
            "La nueva contraseña debe incluir mayúscula, minúscula y número",
        });
      }

      if (passwordNueva !== confirmarPassword) {
        return res.status(400).json({
          ok: false,
          message:
            "La confirmación no coincide con la nueva contraseña",
        });
      }

      if (passwordActual === passwordNueva) {
        return res.status(400).json({
          ok: false,
          message:
            "La nueva contraseña debe ser diferente a la actual",
        });
      }

      const usuario =
        await AuthModel.obtenerConPasswordPorId(
          req.usuario.idUsuario
        );

      if (!usuario || !usuario.ESTADO) {
        return res.status(404).json({
          ok: false,
          message: "Usuario no encontrado",
        });
      }

      const passwordCorrecta = await bcrypt.compare(
        passwordActual,
        usuario.PASSWORD_HASH
      );

      if (!passwordCorrecta) {
        return res.status(401).json({
          ok: false,
          message:
            "La contraseña actual es incorrecta",
        });
      }

      const coincideConAnterior =
        await bcrypt.compare(
          passwordNueva,
          usuario.PASSWORD_HASH
        );

      if (coincideConAnterior) {
        return res.status(400).json({
          ok: false,
          message:
            "La nueva contraseña debe ser diferente a la actual",
        });
      }

      const nuevoHash = await bcrypt.hash(
        passwordNueva,
        12
      );

      const actualizado =
        await AuthModel.actualizarPassword(
          usuario.IDUSUARIO,
          nuevoHash
        );

      if (!actualizado) {
        return res.status(400).json({
          ok: false,
          message:
            "No se pudo actualizar la contraseña",
        });
      }

      await registrarAuditoria({
        req,
        idUsuario: usuario.IDUSUARIO,
        modulo: "AUTENTICACION",
        accion: "EDITAR",
        entidad: "USUARIO",
        identidad: usuario.IDUSUARIO,
        descripcion:
          "El usuario cambió su contraseña",
        datosNuevos: {
          resultado: "CONTRASENA_ACTUALIZADA",
        },
      });

      return res.json({
        ok: true,
        message:
          "Contraseña actualizada correctamente",
      });
    } catch (error) {
      console.error(
        "Error cambiando contraseña:",
        error
      );

      return res.status(500).json({
        ok: false,
        message:
          "No se pudo cambiar la contraseña",
      });
    }
  }

  static async obtenerPerfil(req, res) {
    try {
      const usuario = await AuthModel.obtenerPorId(
        req.usuario.idUsuario
      );

      if (!usuario) {
        return res.status(404).json({
          ok: false,
          message: "Usuario no encontrado",
        });
      }

      return res.json({
        ok: true,
        data: usuario,
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        message: "No se pudo obtener el perfil",
        error: error.message,
      });
    }
  }
}

module.exports = AuthController;