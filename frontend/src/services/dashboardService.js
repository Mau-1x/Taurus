const API_URL = "http://localhost:3000/api/dashboard";

export async function obtenerDashboard() {
  const respuesta = await fetch(API_URL);
  const resultado = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      resultado.message || "No se pudo cargar el dashboard"
    );
  }

  return resultado.data;
}