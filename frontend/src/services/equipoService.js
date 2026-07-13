import { apiFetch } from "./apiClient";

import {
  obtenerToken,
} from "./authService";

const API_URL = `${
  import.meta.env.VITE_API_URL || "http://localhost:3000"
}/api/equipos`;

async function procesarRespuesta(respuesta) {
  const resultado = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(resultado.message || "Ocurrió un error");
  }

  return resultado;
}

export async function obtenerEquipos() {
  const respuesta = await apiFetch(API_URL);
  const resultado = await procesarRespuesta(respuesta);
  return resultado.data;
}

export async function obtenerMarcas() {
  const respuesta = await apiFetch(`${API_URL}/marcas`);
  const resultado = await procesarRespuesta(respuesta);
  return resultado.data;
}

export async function obtenerModelosPorMarca(idMarca) {
  const respuesta = await apiFetch(
    `${API_URL}/modelos/marca/${idMarca}`
  );

  const resultado = await procesarRespuesta(respuesta);
  return resultado.data;
}

export async function crearEquipo(datos) {
  const respuesta = await apiFetch(API_URL, {
    method: "POST",
    body: JSON.stringify(datos),
  });

  return procesarRespuesta(respuesta);
}

export async function actualizarEquipo(idEquipo, datos) {
  const respuesta = await apiFetch(`${API_URL}/${idEquipo}`, {
    method: "PUT",
    body: JSON.stringify(datos),
  });

  return procesarRespuesta(respuesta);
}

export async function eliminarEquipo(idEquipo) {
  const respuesta = await apiFetch(`${API_URL}/${idEquipo}`, {
    method: "DELETE",
  });

  return procesarRespuesta(respuesta);
}

export async function obtenerFotosEquipo(idEquipo) {
  const respuesta = await apiFetch(
    `${API_URL}/${idEquipo}/fotos`
  );

  const resultado =
    await procesarRespuesta(respuesta);

  return resultado.data;
}

export async function subirFotoEquipo(
  idEquipo,
  datos
) {
  const formulario = new FormData();

  formulario.append("foto", datos.foto);
  formulario.append(
    "tipoFoto",
    datos.tipoFoto
  );

  if (datos.descripcion) {
    formulario.append(
      "descripcion",
      datos.descripcion
    );
  }

  const respuesta = await fetch(
    `${API_URL}/${idEquipo}/fotos`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${obtenerToken()}`,
      },
      body: formulario,
    }
  );

  return procesarRespuesta(respuesta);
}

export async function eliminarFotoEquipo(
  idEquipo,
  idFoto
) {
  const respuesta = await apiFetch(
    `${API_URL}/${idEquipo}/fotos/${idFoto}`,
    {
      method: "DELETE",
    }
  );

  return procesarRespuesta(respuesta);
}