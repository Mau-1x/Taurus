import { apiFetch } from "./apiClient";

const API_URL = `${
  import.meta.env.VITE_API_URL || "http://localhost:3000"
}/api/clientes`;

async function procesarRespuesta(respuesta) {
  const resultado = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(resultado.message || "Ocurrió un error");
  }

  return resultado;
}

export async function obtenerClientes() {
  const respuesta = await apiFetch(API_URL);
  const resultado = await procesarRespuesta(respuesta);

  return resultado.data;
}

export async function crearCliente(datos) {
  const respuesta = await apiFetch(API_URL, {
    method: "POST",
    body: JSON.stringify(datos),
  });

  return procesarRespuesta(respuesta);
}

export async function actualizarCliente(idCliente, datos) {
  const respuesta = await apiFetch(`${API_URL}/${idCliente}`, {
    method: "PUT",
    body: JSON.stringify(datos),
  });

  return procesarRespuesta(respuesta);
}

export async function eliminarCliente(idCliente) {
  const respuesta = await apiFetch(`${API_URL}/${idCliente}`, {
    method: "DELETE",
  });

  return procesarRespuesta(respuesta);
}