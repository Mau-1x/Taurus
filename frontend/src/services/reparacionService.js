const API_URL = `${
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000"
}/api/reparaciones`;

export async function buscarReparacionesPorDni(
  dni
) {
  let respuesta;

  try {
    respuesta = await fetch(
      `${API_URL}/seguimiento`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dni,
        }),
      }
    );
  } catch {
    throw new Error(
      "No se pudo conectar con el servidor. Inténtalo nuevamente."
    );
  }

  let resultado;

  try {
    resultado = await respuesta.json();
  } catch {
    throw new Error(
      "El servidor devolvió una respuesta no válida."
    );
  }

  if (!respuesta.ok) {
    throw new Error(
      resultado.message ||
        "No se pudo consultar la reparación."
    );
  }

  return resultado.data;
}
