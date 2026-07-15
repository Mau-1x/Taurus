const API_URL = `${
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000"
}/api/reparaciones`;

export async function obtenerGaleriaPublica(
  limite = 8
) {
  const cantidad = Math.min(
    Math.max(Number(limite) || 8, 1),
    12
  );

  const respuesta = await fetch(
    `${API_URL}/galeria-publica?limite=${cantidad}`
  );

  let resultado;

  try {
    resultado = await respuesta.json();
  } catch {
    throw new Error(
      "El servidor devolvió una respuesta no válida"
    );
  }

  if (!respuesta.ok) {
    throw new Error(
      resultado.message ||
        "No se pudo cargar la galería"
    );
  }

  return Array.isArray(resultado.data)
    ? resultado.data
    : [];
}
