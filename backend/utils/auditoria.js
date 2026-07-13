const AuditoriaModel = require(
  "../models/auditoria.model"
);

function limpiarDatos(datos) {
  if (!datos || typeof datos !== "object") {
    return datos;
  }

  const copia = { ...datos };

  const camposProhibidos = [
    "password",
    "passwordHash",
    "PASSWORD_HASH",
    "token",
    "jwt",
    "apiSecret",
    "apiKey",
  ];

  camposProhibidos.forEach((campo) => {
    delete copia[campo];
  });

  return copia;
}

function convertirJson(datos) {
  if (datos == null) return null;

  try {
    return JSON.stringify(
      limpiarDatos(datos)
    );
  } catch {
    return null;
  }
}

function obtenerIp(req) {
  const forwarded =
    req.headers["x-forwarded-for"];

  if (forwarded) {
    return String(forwarded)
      .split(",")[0]
      .trim()
      .slice(0, 45);
  }

  return (
    req.socket?.remoteAddress ||
    req.ip ||
    null
  );
}

async function registrarAuditoria({
  req,
  idUsuario,
  modulo,
  accion,
  entidad,
  identidad,
  descripcion,
  datosAnteriores,
  datosNuevos,
}) {
  try {
    await AuditoriaModel.registrar({
      idUsuario:
        idUsuario ||
        req?.usuario?.idUsuario ||
        null,

      modulo,
      accion,
      entidad,
      identidad: identidad || null,
      descripcion: descripcion || null,

      datosAnteriores:
        convertirJson(datosAnteriores),

      datosNuevos:
        convertirJson(datosNuevos),

      ip: req ? obtenerIp(req) : null,

      userAgent: req
        ? String(
            req.headers["user-agent"] || ""
          ).slice(0, 500)
        : null,
    });
  } catch (error) {
    console.error(
      "No se pudo registrar la auditoría:",
      error.message
    );
  }
}

module.exports = {
  registrarAuditoria,
};