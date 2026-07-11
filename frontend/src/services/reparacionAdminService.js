const API_URL = "http://localhost:3000/api/reparaciones";

async function procesarRespuesta(respuesta) {
  const resultado = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(resultado.message || "Ocurrió un error");
  }

  return resultado;
}

export async function obtenerReparaciones() {
  const respuesta = await fetch(API_URL);
  const resultado = await procesarRespuesta(respuesta);
  return resultado.data;
}

export async function obtenerEstadosReparacion() {
  const respuesta = await fetch(`${API_URL}/estados`);
  const resultado = await procesarRespuesta(respuesta);
  return resultado.data;
}

export async function crearReparacion(datos) {
  const respuesta = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datos),
  });

  return procesarRespuesta(respuesta);
}

export async function actualizarReparacion(idReparacion, datos) {
  const respuesta = await fetch(`${API_URL}/${idReparacion}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datos),
  });

  return procesarRespuesta(respuesta);
}

export async function cambiarEstadoReparacion(
  idReparacion,
  datos
) {
  const respuesta = await fetch(
    `${API_URL}/${idReparacion}/estado`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datos),
    }
  );

  return procesarRespuesta(respuesta);
}