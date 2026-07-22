const fs = require("fs");
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

function sanitizeSegment(value) {
  const sanitized = String(value)
    .replace(/[<>:"|?*\x00-\x1F]/g, "_")
    .replace(/^\.+$/, "_")
    .trim();

  return sanitized || "_";
}

function localRelativePath(resource) {
  const publicIdSegments = String(resource.public_id)
    .split("/")
    .filter(Boolean)
    .map(sanitizeSegment);

  const extension = sanitizeSegment(
    resource.format || "bin"
  );

  const filename = `${publicIdSegments.pop() || "asset"}.${extension}`;

  return path.join(
    "assets",
    ...publicIdSegments,
    filename
  );
}

async function downloadWithRetry(url, destination, attempts = 3) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: "follow",
        headers: {
          "User-Agent": "TaurusBackup/1.0",
        },
      });

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status} al descargar ${url}`
        );
      }

      const buffer = Buffer.from(
        await response.arrayBuffer()
      );

      await fsp.mkdir(
        path.dirname(destination),
        { recursive: true }
      );

      await fsp.writeFile(destination, buffer);

      return {
        bytesDownloaded: buffer.length,
        sha256: require("crypto")
          .createHash("sha256")
          .update(buffer)
          .digest("hex"),
      };
    } catch (error) {
      lastError = error;

      if (attempt < attempts) {
        await new Promise((resolve) =>
          setTimeout(resolve, attempt * 1200)
        );
      }
    }
  }

  throw lastError;
}

async function listAllResources(cloudinary) {
  const resources = [];
  let nextCursor;

  do {
    const response = await cloudinary.api.resources({
      resource_type: "image",
      type: "upload",
      max_results: 500,
      next_cursor: nextCursor,
      context: true,
      metadata: true,
    });

    resources.push(...response.resources);
    nextCursor = response.next_cursor;
  } while (nextCursor);

  return resources;
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

  if (!args.output) {
    throw new Error(
      "Uso: node backup-cloudinary.js --output <carpeta> [--env <archivo>]"
    );
  }

  const outputDirectory = path.resolve(args.output);
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

  await fsp.mkdir(outputDirectory, {
    recursive: true,
  });

  console.log("Consultando recursos de Cloudinary...");
  const resources = await listAllResources(cloudinary);

  console.log(
    `Se encontraron ${resources.length} imágenes.`
  );

  const manifestResources = new Array(resources.length);
  let completed = 0;

  await runPool(
    resources,
    4,
    async (resource, index) => {
      const relativePath = localRelativePath(resource);
      const destination = path.join(
        outputDirectory,
        relativePath
      );

      const download = await downloadWithRetry(
        resource.secure_url,
        destination
      );

      manifestResources[index] = {
        asset_id: resource.asset_id,
        public_id: resource.public_id,
        resource_type: resource.resource_type,
        type: resource.type,
        format: resource.format,
        version: resource.version,
        bytesCloudinary: resource.bytes,
        bytesDownloaded: download.bytesDownloaded,
        sha256: download.sha256,
        width: resource.width,
        height: resource.height,
        created_at: resource.created_at,
        secure_url: resource.secure_url,
        localPath: relativePath.replace(/\\/g, "/"),
      };

      completed += 1;

      if (
        completed === resources.length ||
        completed % 10 === 0
      ) {
        console.log(
          `Descargadas ${completed}/${resources.length}`
        );
      }
    }
  );

  const manifest = {
    createdAt: new Date().toISOString(),
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    resourceType: "image",
    deliveryType: "upload",
    count: manifestResources.length,
    resources: manifestResources,
  };

  await fsp.writeFile(
    path.join(outputDirectory, "manifest.json"),
    JSON.stringify(manifest, null, 2),
    "utf8"
  );

  console.log(
    `Copia de Cloudinary completada en: ${outputDirectory}`
  );
}

main().catch((error) => {
  console.error(
    "No se pudo completar la copia de Cloudinary:",
    error.message
  );
  process.exitCode = 1;
});
