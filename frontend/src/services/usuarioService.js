import { apiFetch } from "./apiClient";

const API_URL = `${
  import.meta.env.VITE_API_URL || "http://localhost:3000"
}/api/usuarios`;

async function procesarRespuesta(respuesta) {
  const resultado = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      resultado.message || "No se pudo procesar la solicitud"
    );
  }

  return resultado;
}

export async function obtenerUsuarios() {
  const respuesta = await apiFetch(API_URL);
  const resultado = await procesarRespuesta(respuesta);

  return resultado.data;
}

export async function obtenerRoles() {
  const respuesta = await apiFetch(`${API_URL}/roles`);
  const resultado = await procesarRespuesta(respuesta);

  return resultado.data;
}

export async function crearUsuario(datos) {
  const respuesta = await apiFetch(API_URL, {
    method: "POST",
    body: JSON.stringify(datos),
  });

  return procesarRespuesta(respuesta);
}

export async function actualizarUsuario(idUsuario, datos) {
  const respuesta = await apiFetch(`${API_URL}/${idUsuario}`, {
    method: "PUT",
    body: JSON.stringify(datos),
  });

  return procesarRespuesta(respuesta);
}

export async function cambiarEstadoUsuario(idUsuario, estado) {
  const respuesta = await apiFetch(
    `${API_URL}/${idUsuario}/estado`,
    {
      method: "PATCH",
      body: JSON.stringify({ estado }),
    }
  );

  return procesarRespuesta(respuesta);
}