const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const AuthModel = require(
  "../models/auth.model"
);

const {
  registrarAuditoria,
} = require("../utils/auditoria");

const JWT_ISSUER = "taurus-api";
const JWT_AUDIENCE =
  "taurus-frontend";

const hashFalsoPromise = bcrypt.hash(
  "credencial-interna-no-valida-taurus",
  12
);

function validarCorreo(correo) {
  return (
    typeof correo === "string" &&
    correo.length <= 150 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(
      correo.trim()
    )
  );
}

function validarNombre(nombre) {
  return (
    typeof nombre === "string" &&
    nombre.trim().length >= 3 &&
    nombre.trim().length <= 120
  );
}

function validarPassword(password) {
  if (
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 72
  ) {
    return false;
  }

  return (
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password)
  );
}

async function responderCredencialIncorrecta(
  res
) {
  return res.status(401).json({
    ok: false,
    message:
      "Correo o contraseña incorrectos",
  });
}

class AuthController {
  static async registrarAdministrador(
    req,
    res
  ) {
    try {
      const {
        nombre,
        correo,
        password,
      } = req.body;

      if (!validarNombre(nombre)) {
        return res.status(400).json({
          ok: false,
          message:
            "El nombre debe tener entre 3 y 120 caracteres",
        });
      }

      if (!validarCorreo(correo)) {
        return res.status(400).json({
          ok: false,
          message:
            "El correo electrónico no es válido",
        });
      }

      if (!validarPassword(password)) {
        return res.status(400).json({
          ok: false,
          message:
            "La contraseña debe tener entre 8 y 72 caracteres e incluir mayúscula, minúscula y número",
        });
      }

      const correoNormalizado =
        correo.trim().toLowerCase();

      const usuarioExistente =
        await AuthModel.buscarPorCorreo(
          correoNormalizado
        );

      if (usuarioExistente) {
        return res.status(409).json({
          ok: false,
          message:
            "El correo ya está registrado",
        });
      }

      const passwordHash =
        await bcrypt.hash(
          password,
          12
        );

      const usuario =
        await AuthModel.crearAdministrador({
          nombre: nombre.trim(),
          correo: correoNormalizado,
          passwordHash,
        });

      return res.status(201).json({
        ok: true,
        message:
          "Administrador registrado correctamente",
        data: usuario,
      });
    } catch (error) {
      console.error(
        "Error registrando administrador:",
        error
      );

      return res.status(500).json({
        ok: false,
        message:
          "No se pudo registrar el administrador",
      });
    }
  }

  static async iniciarSesion(
    req,
    res
  ) {
    try {
      const {
        correo,
        password,
      } = req.body;

      if (
        !validarCorreo(correo) ||
        typeof password !== "string" ||
        password.length === 0 ||
        password.length > 72
      ) {
        return res.status(400).json({
          ok: false,
          message:
            "Correo o contraseña no válidos",
        });
      }

      const correoNormalizado =
        correo.trim().toLowerCase();

      const usuario =
        await AuthModel.buscarPorCorreo(
          correoNormalizado
        );

      if (!usuario) {
        /*
         * Se realiza una comparación falsa para reducir
         * diferencias de tiempo entre correos existentes
         * y no existentes.
         */
        await bcrypt.compare(
          password,
          await hashFalsoPromise
        );

        await registrarAuditoria({
          req,
          modulo: "AUTENTICACION",
          accion: "INICIAR_SESION",
          entidad: "USUARIO",
          descripcion:
            "Intento de inicio de sesión fallido",
          datosNuevos: {
            correo:
              correoNormalizado,
            resultado: "FALLIDO",
            motivo:
              "CREDENCIALES_INVALIDAS",
          },
        });

        return responderCredencialIncorrecta(
          res
        );
      }

      const passwordCorrecta =
        await bcrypt.compare(
          password,
          usuario.PASSWORD_HASH
        );

      if (
        !usuario.ESTADO ||
        !passwordCorrecta
      ) {
        await registrarAuditoria({
          req,
          idUsuario:
            usuario.IDUSUARIO,
          modulo: "AUTENTICACION",
          accion: "INICIAR_SESION",
          entidad: "USUARIO",
          identidad:
            usuario.IDUSUARIO,
          descripcion:
            "Intento de inicio de sesión fallido",
          datosNuevos: {
            correo: usuario.CORREO,
            resultado: "FALLIDO",
            motivo:
              "CREDENCIALES_INVALIDAS",
          },
        });

        return responderCredencialIncorrecta(
          res
        );
      }

      const token = jwt.sign(
        {
          idUsuario:
            usuario.IDUSUARIO,
          idRol: usuario.IDROL,
          rol: usuario.ROL,
        },
        process.env.JWT_SECRET,
        {
          algorithm: "HS256",
          expiresIn:
            process.env.JWT_EXPIRES_IN ||
            "8h",
          issuer: JWT_ISSUER,
          audience: JWT_AUDIENCE,
          subject: String(
            usuario.IDUSUARIO
          ),
          jwtid:
            crypto.randomUUID(),
        }
      );

      await AuthModel.actualizarUltimoAcceso(
        usuario.IDUSUARIO
      );

      await registrarAuditoria({
        req,
        idUsuario:
          usuario.IDUSUARIO,
        modulo: "AUTENTICACION",
        accion: "INICIAR_SESION",
        entidad: "USUARIO",
        identidad:
          usuario.IDUSUARIO,
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
        message:
          "Inicio de sesión correcto",
        data: {
          token,
          usuario: {
            idUsuario:
              usuario.IDUSUARIO,
            nombre: usuario.NOMBRE,
            correo: usuario.CORREO,
            rol: usuario.ROL,
          },
        },
      });
    } catch (error) {
      console.error(
        "Error iniciando sesión:",
        error
      );

      return res.status(500).json({
        ok: false,
        message:
          "No se pudo iniciar sesión",
      });
    }
  }

  static async cambiarPassword(
    req,
    res
  ) {
    try {
      const {
        passwordActual,
        passwordNueva,
        confirmarPassword,
      } = req.body;

      if (
        typeof passwordActual !==
          "string" ||
        typeof passwordNueva !==
          "string" ||
        typeof confirmarPassword !==
          "string"
      ) {
        return res.status(400).json({
          ok: false,
          message:
            "Los datos enviados no son válidos",
        });
      }

      if (
        passwordActual.length === 0 ||
        passwordActual.length > 72
      ) {
        return res.status(400).json({
          ok: false,
          message:
            "La contraseña actual no es válida",
        });
      }

      if (
        !validarPassword(
          passwordNueva
        )
      ) {
        return res.status(400).json({
          ok: false,
          message:
            "La nueva contraseña debe tener entre 8 y 72 caracteres e incluir mayúscula, minúscula y número",
        });
      }

      if (
        passwordNueva !==
        confirmarPassword
      ) {
        return res.status(400).json({
          ok: false,
          message:
            "La confirmación no coincide con la nueva contraseña",
        });
      }

      if (
        passwordActual ===
        passwordNueva
      ) {
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

      if (
        !usuario ||
        !usuario.ESTADO
      ) {
        return res.status(401).json({
          ok: false,
          message:
            "La sesión ya no es válida",
        });
      }

      const passwordCorrecta =
        await bcrypt.compare(
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

      const nuevoHash =
        await bcrypt.hash(
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
        idUsuario:
          usuario.IDUSUARIO,
        modulo: "AUTENTICACION",
        accion: "EDITAR",
        entidad: "USUARIO",
        identidad:
          usuario.IDUSUARIO,
        descripcion:
          "El usuario cambió su contraseña",
        datosNuevos: {
          resultado:
            "CONTRASENA_ACTUALIZADA",
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

  static async obtenerPerfil(
    req,
    res
  ) {
    try {
      const usuario =
        await AuthModel.obtenerPorId(
          req.usuario.idUsuario
        );

      if (!usuario) {
        return res.status(404).json({
          ok: false,
          message:
            "Usuario no encontrado",
        });
      }

      return res.json({
        ok: true,
        data: usuario,
      });
    } catch (error) {
      console.error(
        "Error obteniendo perfil:",
        error
      );

      return res.status(500).json({
        ok: false,
        message:
          "No se pudo obtener el perfil",
      });
    }
  }
}

module.exports = AuthController;
