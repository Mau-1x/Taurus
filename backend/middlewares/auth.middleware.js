const jwt = require("jsonwebtoken");

const UsuarioModel = require(
  "../models/usuario.model"
);

const JWT_ISSUER = "taurus-api";
const JWT_AUDIENCE =
  "taurus-frontend";

async function verificarToken(
  req,
  res,
  next
) {
  const encabezado =
    req.headers.authorization;

  if (
    typeof encabezado !== "string"
  ) {
    return res.status(401).json({
      ok: false,
      message:
        "No se proporcionó un token",
    });
  }

  const partes = encabezado
    .trim()
    .split(/\s+/);

  if (
    partes.length !== 2 ||
    partes[0] !== "Bearer" ||
    !partes[1] ||
    partes[1].length > 4096
  ) {
    return res.status(401).json({
      ok: false,
      message:
        "El token no tiene un formato válido",
    });
  }

  try {
    const datos = jwt.verify(
      partes[1],
      process.env.JWT_SECRET,
      {
        algorithms: ["HS256"],
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      }
    );

    const idUsuario = Number(
      datos.idUsuario
    );

    if (
      !Number.isInteger(idUsuario) ||
      idUsuario <= 0 ||
      String(datos.sub) !==
        String(idUsuario)
    ) {
      return res.status(401).json({
        ok: false,
        message:
          "Token inválido o expirado",
      });
    }

    const usuario =
      await UsuarioModel.obtenerPorId(
        idUsuario
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

    req.usuario = {
      idUsuario:
        usuario.IDUSUARIO,
      idRol: usuario.IDROL,
      rol: String(
        usuario.ROL || ""
      ).toUpperCase(),
      nombre: usuario.NOMBRE,
      correo: usuario.CORREO,
    };

    return next();
  } catch (error) {
    if (
      error.name ===
        "TokenExpiredError" ||
      error.name ===
        "JsonWebTokenError" ||
      error.name ===
        "NotBeforeError"
    ) {
      return res.status(401).json({
        ok: false,
        message:
          "Token inválido o expirado",
      });
    }

    return next(error);
  }
}

function permitirRoles(
  ...rolesPermitidos
) {
  const roles = rolesPermitidos.map(
    (rol) =>
      String(rol).toUpperCase()
  );

  return function (
    req,
    res,
    next
  ) {
    if (
      !req.usuario ||
      !roles.includes(
        req.usuario.rol
      )
    ) {
      return res.status(403).json({
        ok: false,
        message:
          "No tienes permisos para realizar esta acción",
      });
    }

    return next();
  };
}

module.exports = {
  verificarToken,
  permitirRoles,
};
