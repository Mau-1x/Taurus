import { apiFetch } from "./apiClient";

const API_URL = `${
  import.meta.env.VITE_API_URL || "http://localhost:3000"
}/api/ventas`;

async function procesarRespuesta(respuesta) {
  const resultado = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(resultado.message || "Ocurrió un error");
  }

  return resultado;
}

export async function obtenerVentas() {
  const respuesta = await apiFetch(API_URL);
  const resultado = await procesarRespuesta(respuesta);
  return resultado.data;
}

export async function obtenerVentaPorId(idVenta) {
  const respuesta = await apiFetch(`${API_URL}/${idVenta}`);
  const resultado = await procesarRespuesta(respuesta);
  return resultado.data;
}

export async function crearVenta(datos) {
  const respuesta = await apiFetch(API_URL, {
    method: "POST",
    body: JSON.stringify(datos),
  });

  return procesarRespuesta(respuesta);
}

export async function anularVenta(idVenta) {
  const respuesta = await apiFetch(`${API_URL}/${idVenta}/anular`, {
    method: "PATCH",
  });

  return procesarRespuesta(respuesta);
}