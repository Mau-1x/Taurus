import { apiFetch } from "./apiClient";

const API_URL = `${
  import.meta.env.VITE_API_URL || "http://localhost:3000"
}/api/reparaciones`;

async function procesarRespuesta(respuesta) {
  const resultado = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      resultado.message || "Ocurrió un error"
    );
  }

  return resultado;
}

export async function obtenerReparaciones() {
  const respuesta = await apiFetch(API_URL);
  const resultado = await procesarRespuesta(respuesta);

  return resultado.data;
}

export async function obtenerEstadosReparacion() {
  const respuesta = await apiFetch(
    `${API_URL}/estados`
  );

  const resultado = await procesarRespuesta(respuesta);

  return resultado.data;
}

export async function crearReparacion(datos) {
  const respuesta = await apiFetch(API_URL, {
    method: "POST",
    body: JSON.stringify(datos),
  });

  return procesarRespuesta(respuesta);
}

export async function actualizarReparacion(
  idReparacion,
  datos
) {
  const respuesta = await apiFetch(
    `${API_URL}/${idReparacion}`,
    {
      method: "PUT",
      body: JSON.stringify(datos),
    }
  );

  return procesarRespuesta(respuesta);
}

export async function cambiarEstadoReparacion(
  idReparacion,
  datos
) {
  const respuesta = await apiFetch(
    `${API_URL}/${idReparacion}/estado`,
    {
      method: "PATCH",
      body: JSON.stringify(datos),
    }
  );

  return procesarRespuesta(respuesta);
}

export async function obtenerRepuestosReparacion(
  idReparacion
) {
  const respuesta = await apiFetch(
    `${API_URL}/${idReparacion}/repuestos`
  );

  const resultado = await procesarRespuesta(respuesta);

  return resultado.data;
}

export async function agregarRepuestoReparacion(
  idReparacion,
  datos
) {
  const respuesta = await apiFetch(
    `${API_URL}/${idReparacion}/repuestos`,
    {
      method: "POST",
      body: JSON.stringify(datos),
    }
  );

  return procesarRespuesta(respuesta);
}

export async function quitarRepuestoReparacion(
  idReparacion,
  idProducto
) {
  const respuesta = await apiFetch(
    `${API_URL}/${idReparacion}/repuestos/${idProducto}`,
    {
      method: "DELETE",
    }
  );

  return procesarRespuesta(respuesta);
}

export async function obtenerPagosReparacion(
  idReparacion
) {
  const respuesta = await apiFetch(
    `${API_URL}/${idReparacion}/pagos`
  );

  const resultado = await procesarRespuesta(respuesta);

  return resultado.data;
}

export async function registrarPagoReparacion(
  idReparacion,
  datos
) {
  const respuesta = await apiFetch(
    `${API_URL}/${idReparacion}/pagos`,
    {
      method: "POST",
      body: JSON.stringify(datos),
    }
  );

  return procesarRespuesta(respuesta);
}

export async function anularPagoReparacion(
  idReparacion,
  idPago
) {
  const respuesta = await apiFetch(
    `${API_URL}/${idReparacion}/pagos/${idPago}`,
    {
      method: "DELETE",
    }
  );

  return procesarRespuesta(respuesta);
}