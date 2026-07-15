import { apiFetch } from "./apiClient";

const API_URL = `${
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000"
}/api/reparaciones`;

async function procesarRespuesta(respuesta) {
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
      resultado.message || "Ocurrió un error"
    );
  }

  return resultado;
}

export async function obtenerPanelGarantias() {
  const respuesta = await apiFetch(
    `${API_URL}/garantias`
  );

  const resultado =
    await procesarRespuesta(respuesta);

  return resultado.data;
}

export async function registrarReclamoGarantia(
  idReparacion,
  datos
) {
  const respuesta = await apiFetch(
    `${API_URL}/${idReparacion}/garantias`,
    {
      method: "POST",
      body: JSON.stringify(datos),
    }
  );

  return procesarRespuesta(respuesta);
}

export async function actualizarReclamoGarantia(
  idGarantia,
  datos
) {
  const respuesta = await apiFetch(
    `${API_URL}/garantias/${idGarantia}`,
    {
      method: "PATCH",
      body: JSON.stringify(datos),
    }
  );

  return procesarRespuesta(respuesta);
}

export async function obtenerHistorialGarantia(
  idGarantia
) {
  const respuesta = await apiFetch(
    `${API_URL}/garantias/${idGarantia}/historial`
  );

  const resultado =
    await procesarRespuesta(respuesta);

  return resultado.data;
}
