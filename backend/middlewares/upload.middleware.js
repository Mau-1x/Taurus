const path = require("path");
const multer = require("multer");

const almacenamiento =
  multer.memoryStorage();

const extensionesPorTipo = {
  "image/jpeg": [
    ".jpg",
    ".jpeg",
  ],
  "image/png": [
    ".png",
  ],
  "image/webp": [
    ".webp",
  ],
};

function crearErrorArchivo(
  mensaje,
  statusCode = 415
) {
  const error = new Error(mensaje);

  error.statusCode = statusCode;
  error.publicMessage = mensaje;

  return error;
}

const upload = multer({
  storage: almacenamiento,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
    fields: 8,
    parts: 10,
    fieldNameSize: 100,
    fieldSize: 50 * 1024,
    headerPairs: 100,
  },
  fileFilter(req, file, callback) {
    const tipo = String(
      file.mimetype || ""
    ).toLowerCase();

    const nombre = String(
      file.originalname || ""
    );

    const extension = path
      .extname(nombre)
      .toLowerCase();

    if (
      !extensionesPorTipo[tipo]
    ) {
      return callback(
        crearErrorArchivo(
          "Solo se permiten imágenes JPG, PNG o WEBP"
        )
      );
    }

    if (
      !extensionesPorTipo[
        tipo
      ].includes(extension)
    ) {
      return callback(
        crearErrorArchivo(
          "La extensión del archivo no coincide con su tipo"
        )
      );
    }

    if (
      nombre.length > 180 ||
      /[\0-\x1F\x7F]/.test(nombre)
    ) {
      return callback(
        crearErrorArchivo(
          "El nombre del archivo no es válido",
          400
        )
      );
    }

    return callback(null, true);
  },
});

function detectarTipoReal(buffer) {
  if (
    !Buffer.isBuffer(buffer) ||
    buffer.length < 12
  ) {
    return null;
  }

  const esJpeg =
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff;

  if (esJpeg) {
    return "image/jpeg";
  }

  const firmaPng = [
    0x89,
    0x50,
    0x4e,
    0x47,
    0x0d,
    0x0a,
    0x1a,
    0x0a,
  ];

  const esPng =
    firmaPng.every(
      (valor, indice) =>
        buffer[indice] === valor
    );

  if (esPng) {
    return "image/png";
  }

  const esWebp =
    buffer
      .subarray(0, 4)
      .toString("ascii") ===
      "RIFF" &&
    buffer
      .subarray(8, 12)
      .toString("ascii") ===
      "WEBP";

  if (esWebp) {
    return "image/webp";
  }

  return null;
}

function validarImagenReal(
  req,
  res,
  next
) {
  if (!req.file) {
    return res.status(400).json({
      ok: false,
      message:
        "Debes seleccionar una imagen",
    });
  }

  const tipoReal =
    detectarTipoReal(
      req.file.buffer
    );

  if (
    !tipoReal ||
    tipoReal !==
      req.file.mimetype
  ) {
    return res.status(415).json({
      ok: false,
      message:
        "El contenido del archivo no corresponde a una imagen válida",
    });
  }

  req.file.mimetype = tipoReal;

  return next();
}

module.exports = {
  upload,
  validarImagenReal,
};
