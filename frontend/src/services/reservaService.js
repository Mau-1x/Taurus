import { apiFetch } from "./apiClient";

const API_URL = "http://localhost:3000/api/reservas";

async function procesarRespuesta(respuesta) {
  const resultado = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      resultado.message || "No se pudo procesar la reserva"
    );
  }

  return resultado;
}

export async function obtenerReservas() {
  const respuesta = await apiFetch(API_URL);
  const resultado = await procesarRespuesta(respuesta);

  return resultado.data;
}

export async function obtenerReservaPorId(idReserva) {
  const respuesta = await apiFetch(`${API_URL}/${idReserva}`);
  const resultado = await procesarRespuesta(respuesta);

  return resultado.data;
}

export async function crearReserva(datos) {
  const respuesta = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datos),
  });

  return procesarRespuesta(respuesta);
}

export async function actualizarReserva(idReserva, datos) {
  const respuesta = await apiFetch(`${API_URL}/${idReserva}`, {
    method: "PUT",
    body: JSON.stringify(datos),
  });

  return procesarRespuesta(respuesta);
}

export async function cambiarEstadoReserva(idReserva, estado) {
  const respuesta = await apiFetch(
    `${API_URL}/${idReserva}/estado`,
    {
      method: "PATCH",
      body: JSON.stringify({ estado }),
    }
  );

  return procesarRespuesta(respuesta);
}

export async function eliminarReserva(idReserva) {
  const respuesta = await apiFetch(`${API_URL}/${idReserva}`, {
    method: "DELETE",
  });

  return procesarRespuesta(respuesta);
}