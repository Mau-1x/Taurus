const multer = require("multer");

function rutaNoEncontrada(
  req,
  res
) {
  return res.status(404).json({
    ok: false,
    message: "Ruta no encontrada",
    requestId: req.idSolicitud,
  });
}

function manejarErrorMulter(
  error,
  req,
  res
) {
  const mensajes = {
    LIMIT_FILE_SIZE:
      "La imagen supera el límite de 5 MB",
    LIMIT_FILE_COUNT:
      "Solo se permite una imagen por solicitud",
    LIMIT_UNEXPECTED_FILE:
      "El campo de archivo no es válido",
    LIMIT_FIELD_COUNT:
      "Se enviaron demasiados campos",
    LIMIT_PART_COUNT:
      "La solicitud contiene demasiadas partes",
    LIMIT_FIELD_VALUE:
      "Uno de los campos es demasiado grande",
  };

  return res.status(400).json({
    ok: false,
    message:
      mensajes[error.code] ||
      "No se pudo procesar el archivo",
    requestId: req.idSolicitud,
  });
}

function manejarErrores(
  error,
  req,
  res,
  next
) {
  if (res.headersSent) {
    return next(error);
  }

  console.error(
    `[${req.idSolicitud}] Error no controlado:`,
    error
  );

  if (
    error.code ===
    "CORS_NOT_ALLOWED"
  ) {
    return res.status(403).json({
      ok: false,
      message: "Origen no permitido",
      requestId: req.idSolicitud,
    });
  }

  if (
    error instanceof
    multer.MulterError
  ) {
    return manejarErrorMulter(
      error,
      req,
      res
    );
  }

  if (
    error.type ===
      "entity.too.large" ||
    error.status === 413
  ) {
    return res.status(413).json({
      ok: false,
      message:
        "La solicitud es demasiado grande",
      requestId: req.idSolicitud,
    });
  }

  if (
    error instanceof SyntaxError &&
    error.status === 400 &&
    "body" in error
  ) {
    return res.status(400).json({
      ok: false,
      message:
        "El cuerpo JSON no es válido",
      requestId: req.idSolicitud,
    });
  }

  const estado = Number(
    error.statusCode ||
    error.status
  );

  if (
    Number.isInteger(estado) &&
    estado >= 400 &&
    estado < 500
  ) {
    return res.status(estado).json({
      ok: false,
      message:
        error.publicMessage ||
        error.message ||
        "Solicitud no válida",
      requestId: req.idSolicitud,
    });
  }

  return res.status(500).json({
    ok: false,
    message:
      "Ocurrió un error interno en el servidor",
    requestId: req.idSolicitud,
  });
}

module.exports = {
  rutaNoEncontrada,
  manejarErrores,
};
