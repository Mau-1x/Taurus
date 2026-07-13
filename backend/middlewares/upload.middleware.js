const multer = require("multer");

const almacenamiento = multer.memoryStorage();

const tiposPermitidos = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const upload = multer({
  storage: almacenamiento,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter(req, file, callback) {
    if (!tiposPermitidos.includes(file.mimetype)) {
      return callback(
        new Error(
          "Solo se permiten imágenes JPG, PNG o WEBP"
        )
      );
    }

    callback(null, true);
  },
});

module.exports = upload;