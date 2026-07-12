const bcrypt = require("bcryptjs");
const UsuarioModel = require("../models/usuario.model");

function validarDatosUsuario({
  idRol,
  nombre,
  correo,
  password,
  passwordObligatorio = false,
}) {
  if (
    !Number.isInteger(Number(idRol)) ||
    Number(idRol) <= 0
  ) {
    return "El rol seleccionado no es válido";
  }

  if (
    !nombre ||
    !/^[a-zA-ZÁÉÍÓÚáéíóúÑñüÜ\s-]{3,120}$/.test(
      nombre.trim()
    )
  ) {
    return "El nombre debe contener solo letras y tener entre 3 y 120 caracteres";
  }

  if (
    !correo ||
    correo.length > 150 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(
      correo.trim()
    )
  ) {
    return "El correo electrónico no es válido";
  }

  if (passwordObligatorio && !password) {
    return "La contraseña es obligatoria";
  }

  if (password) {
    if (password.length < 8 || password.length > 72) {
      return "La contraseña debe tener entre 8 y 72 caracteres";
    }

    if (!/[A-Z]/.test(password)) {
      return "La contraseña debe incluir una letra mayúscula";
    }

    if (!/[a-z]/.test(password)) {
      return "La contraseña debe incluir una letra minúscula";
    }

    if (!/\d/.test(password)) {
      return "La contraseña debe incluir un número";
    }
  }

  return null;
}

class UsuarioController {
  static async obtenerTodos(req, res) {
    try {
      const usuarios = await UsuarioModel.obtenerTodos();

      return res.json({
        ok: true,
        data: usuarios,
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        message: "No se pudieron obtener los usuarios",
        error: error.message,
      });
    }
  }

  static async obtenerRoles(req, res) {
    try {
      const roles = await UsuarioModel.obtenerRoles();

      return res.json({
        ok: true,
        data: roles,
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        message: "No se pudieron obtener los roles",
        error: error.message,
      });
    }
  }

  static async crear(req, res) {
    try {
      const {
        idRol,
        nombre,
        correo,
        password,
      } = req.body;

      const errorValidacion = validarDatosUsuario({
        idRol,
        nombre,
        correo,
        password,
        passwordObligatorio: true,
      });

      if (errorValidacion) {
        return res.status(400).json({
          ok: false,
          message: errorValidacion,
        });
      }

      const rolValido = await UsuarioModel.rolExiste(
        Number(idRol)
      );

      if (!rolValido) {
        return res.status(400).json({
          ok: false,
          message: "El rol seleccionado no existe",
        });
      }

      const correoNormalizado = correo.trim().toLowerCase();

      const existente =
        await UsuarioModel.buscarPorCorreo(correoNormalizado);

      if (existente) {
        return res.status(409).json({
          ok: false,
          message: "El correo ya está registrado",
        });
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const usuario = await UsuarioModel.crear({
        idRol: Number(idRol),
        nombre: nombre.trim(),
        correo: correoNormalizado,
        passwordHash,
      });

      return res.status(201).json({
        ok: true,
        message: "Usuario creado correctamente",
        data: usuario,
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        message: "No se pudo crear el usuario",
        error: error.message,
      });
    }
  }

  static async actualizar(req, res) {
    try {
      const {
        idRol,
        nombre,
        correo,
        password,
      } = req.body;

      const idUsuario = Number(req.params.id);

      if (
        !Number.isInteger(idUsuario) ||
        idUsuario <= 0
      ) {
        return res.status(400).json({
          ok: false,
          message: "El usuario no es válido",
        });
      }

      const errorValidacion = validarDatosUsuario({
        idRol,
        nombre,
        correo,
        password,
      });

      if (errorValidacion) {
        return res.status(400).json({
          ok: false,
          message: errorValidacion,
        });
      }

      const rolValido = await UsuarioModel.rolExiste(
        Number(idRol)
      );

      if (!rolValido) {
        return res.status(400).json({
          ok: false,
          message: "El rol seleccionado no existe",
        });
      }

      const usuarioGuardado =
        await UsuarioModel.obtenerPorId(idUsuario);

      if (!usuarioGuardado) {
        return res.status(404).json({
          ok: false,
          message: "Usuario no encontrado",
        });
      }

      if (
        idUsuario === req.usuario.idUsuario &&
        Number(idRol) !== Number(usuarioGuardado.IDROL)
      ) {
        return res.status(400).json({
          ok: false,
          message:
            "No puedes cambiar el rol de tu propia cuenta",
        });
      }

      if (!idRol || !nombre || !correo) {
        return res.status(400).json({
          ok: false,
          message: "Rol, nombre y correo son obligatorios",
        });
      }

      let passwordHash = null;

      if (password) {
        if (password.length < 8) {
          return res.status(400).json({
            ok: false,
            message:
              "La contraseña debe tener al menos 8 caracteres",
          });
        }

        passwordHash = await bcrypt.hash(password, 12);
      }

      const actualizado = await UsuarioModel.actualizar(
        idUsuario,
        {
          idRol: Number(idRol),
          nombre: nombre.trim(),
          correo: correo.trim().toLowerCase(),
          passwordHash,
        }
      );
      
      if (!actualizado) {
        return res.status(404).json({
          ok: false,
          message: "Usuario no encontrado",
        });
      }

      return res.json({
        ok: true,
        message: "Usuario actualizado correctamente",
      });
    } catch (error) {
      if (error.number === 2601 || error.number === 2627) {
        return res.status(409).json({
          ok: false,
          message: "El correo ya está siendo utilizado",
        });
      }

      return res.status(500).json({
        ok: false,
        message: "No se pudo actualizar el usuario",
        error: error.message,
      });
    }
  }

  static async cambiarEstado(req, res) {
    try {
      const idUsuario = Number(req.params.id);
      const estado = Boolean(req.body.estado);

      if (idUsuario === req.usuario.idUsuario && !estado) {
        return res.status(400).json({
          ok: false,
          message: "No puedes desactivar tu propia cuenta",
        });
      }

      const actualizado = await UsuarioModel.cambiarEstado(
        idUsuario,
        estado
      );

      if (!actualizado) {
        return res.status(404).json({
          ok: false,
          message: "Usuario no encontrado",
        });
      }

      return res.json({
        ok: true,
        message: estado
          ? "Usuario activado correctamente"
          : "Usuario desactivado correctamente",
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        message: "No se pudo cambiar el estado",
        error: error.message,
      });
    }
  }
}

module.exports = UsuarioController;