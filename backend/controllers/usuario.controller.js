const bcrypt = require("bcryptjs");
const UsuarioModel = require("../models/usuario.model");

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

      if (!idRol || !nombre || !correo || !password) {
        return res.status(400).json({
          ok: false,
          message: "Completa todos los campos obligatorios",
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
        Number(req.params.id),
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