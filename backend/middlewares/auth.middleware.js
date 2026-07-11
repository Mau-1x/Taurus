const jwt = require("jsonwebtoken");

function verificarToken(req, res, next) {
  try {
    const encabezado = req.headers.authorization;

    if (
      !encabezado ||
      !encabezado.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        ok: false,
        message: "No se proporcionó un token",
      });
    }

    const token = encabezado.split(" ")[1];

    const datos = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.usuario = datos;
    next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      message: "Token inválido o expirado",
    });
  }
}

function permitirRoles(...rolesPermitidos) {
  return function (req, res, next) {
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        ok: false,
        message:
          "No tienes permisos para realizar esta acción",
      });
    }

    next();
  };
}

module.exports = {
  verificarToken,
  permitirRoles,
};