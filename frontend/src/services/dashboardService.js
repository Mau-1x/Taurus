import { apiFetch } from "./apiClient";

const API_URL = `${
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000"
}/api/dashboard`;

export async function obtenerDashboard() {
  const respuesta = await apiFetch(API_URL);

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
        "No se pudo cargar el dashboard"
    );
  }

  return resultado.data;
}
