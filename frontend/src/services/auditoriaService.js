import { apiFetch } from "./apiClient";

const API_URL = `${
  import.meta.env.VITE_API_URL || "http://localhost:3000"
}/api/auditoria`;

async function procesarRespuesta(respuesta) {
  const resultado = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      resultado.message ||
        "No se pudo procesar la solicitud"
    );
  }

  return resultado;
}

export async function obtenerAuditoria(filtros = {}) {
  const parametros = new URLSearchParams();

  if (filtros.modulo) {
    parametros.set("modulo", filtros.modulo);
  }

  if (filtros.accion) {
    parametros.set("accion", filtros.accion);
  }

  if (filtros.idUsuario) {
    parametros.set(
      "idUsuario",
      filtros.idUsuario
    );
  }

  const consulta = parametros.toString();

  const respuesta = await apiFetch(
    consulta ? `${API_URL}?${consulta}` : API_URL
  );

  const resultado =
    await procesarRespuesta(respuesta);

  return resultado.data;
}