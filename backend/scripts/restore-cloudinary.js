const fsp = require("fs/promises");
const path = require("path");

function parseArgs(argv) {
  const result = {};

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];

    if (!value.startsWith("--")) {
      continue;
    }

    const key = value.slice(2);
    const next = argv[index + 1];

    if (next && !next.startsWith("--")) {
      result[key] = next;
      index += 1;
    } else {
      result[key] = true;
    }
  }

  return result;
}

async function runPool(items, concurrency, worker) {
  let nextIndex = 0;

  async function runWorker() {
    while (true) {
      const currentIndex = nextIndex;
      nextIndex += 1;

      if (currentIndex >= items.length) {
        return;
      }

      await worker(items[currentIndex], currentIndex);
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.min(concurrency, items.length || 1) },
      () => runWorker()
    )
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.backup) {
    throw new Error(
      "Uso: node restore-cloudinary.js --backup <carpeta> --confirm RESTAURAR [--overwrite]"
    );
  }

  if (args.confirm !== "RESTAURAR") {
    throw new Error(
      "Por seguridad debes agregar: --confirm RESTAURAR"
    );
  }

  const backupDirectory = path.resolve(args.backup);
  const cloudinaryDirectory =
    path.basename(backupDirectory).toLowerCase() === "cloudinary"
      ? backupDirectory
      : path.join(backupDirectory, "cloudinary");

  const manifestPath = path.join(
    cloudinaryDirectory,
    "manifest.json"
  );

  const manifest = JSON.parse(
    await fsp.readFile(manifestPath, "utf8")
  );

  const envPath = path.resolve(
    args.env ||
      path.join(__dirname, "..", ".env")
  );

  require("dotenv").config({
    path: envPath,
    quiet: true,
  });

  for (const name of [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ]) {
    if (!process.env[name]) {
      throw new Error(
        `Falta la variable ${name}`
      );
    }
  }

  const cloudinary = require("../config/cloudinary");
  const overwrite = Boolean(args.overwrite);

  console.log(
    `Restaurando ${manifest.resources.length} imágenes.`
  );
  console.log(
    `Sobrescribir existentes: ${overwrite ? "sí" : "no"}`
  );

  let completed = 0;

  await runPool(
    manifest.resources,
    3,
    async (resource) => {
      const source = path.join(
        cloudinaryDirectory,
        resource.localPath
      );

      await cloudinary.uploader.upload(source, {
        public_id: resource.public_id,
        resource_type: "image",
        type: "upload",
        overwrite,
        invalidate: overwrite,
      });

      completed += 1;

      if (
        completed === manifest.resources.length ||
        completed % 10 === 0
      ) {
        console.log(
          `Restauradas ${completed}/${manifest.resources.length}`
        );
      }
    }
  );

  console.log("Restauración de Cloudinary completada.");
}

main().catch((error) => {
  console.error(
    "No se pudo restaurar Cloudinary:",
    error.message
  );
  process.exitCode = 1;
});
