import { apiFetch } from "./apiClient";

const API_URL = `${
  import.meta.env.VITE_API_URL || "http://localhost:3000"
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

export async function obtenerFotosReparacion(
  idReparacion
) {
  const respuesta = await apiFetch(
    `${API_URL}/${idReparacion}/fotos`
  );

  const resultado = await procesarRespuesta(respuesta);

  return resultado.data;
}

export async function subirFotoReparacion(
  idReparacion,
  datos
) {
  const formulario = new FormData();

  formulario.append("foto", datos.foto);
  formulario.append("tipo", datos.tipo);
  formulario.append(
    "descripcion",
    datos.descripcion || ""
  );
  formulario.append(
    "visibleCliente",
    String(Boolean(datos.visibleCliente))
  );

  const respuesta = await apiFetch(
    `${API_URL}/${idReparacion}/fotos`,
    {
      method: "POST",
      body: formulario,
    }
  );

  return procesarRespuesta(respuesta);
}

export async function actualizarFotoReparacion(
  idReparacion,
  idFoto,
  datos
) {
  const respuesta = await apiFetch(
    `${API_URL}/${idReparacion}/fotos/${idFoto}`,
    {
      method: "PATCH",
      body: JSON.stringify(datos),
    }
  );

  return procesarRespuesta(respuesta);
}

export async function eliminarFotoReparacion(
  idReparacion,
  idFoto
) {
  const respuesta = await apiFetch(
    `${API_URL}/${idReparacion}/fotos/${idFoto}`,
    {
      method: "DELETE",
    }
  );

  return procesarRespuesta(respuesta);
}
  