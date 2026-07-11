import { apiFetch } from "./apiClient";

const API_URL = "http://localhost:3000/api/reportes";

async function procesarRespuesta(respuesta) {
  const resultado = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      resultado.message || "No se pudieron cargar los reportes"
    );
  }

  return resultado;
}

export async function obtenerReporteGeneral() {
  const respuesta = await apiFetch(API_URL);
  const resultado = await procesarRespuesta(respuesta);

  return resultado.data;
}