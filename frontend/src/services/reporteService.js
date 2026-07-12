import { apiFetch } from "./apiClient";

const API_URL = `${
  import.meta.env.VITE_API_URL || "http://localhost:3000"
}/api/reportes`;

async function procesarRespuesta(respuesta) {
  const resultado = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      resultado.message || "No se pudieron cargar los reportes"
    );
  }

  return resultado;
}

export async function obtenerReporteGeneral() {
  const respuesta = await apiFetch(API_URL);
  const resultado = await procesarRespuesta(respuesta);

  return resultado.data;
}

export async function descargarComprobanteReparacion(
  idReparacion,
  codigo
) {
  const respuesta = await apiFetch(
    `${API_URL}/reparaciones/${idReparacion}/pdf`
  );

  if (!respuesta.ok) {
    let mensaje = "No se pudo descargar el comprobante";

    try {
      const resultado = await respuesta.json();
      mensaje = resultado.message || mensaje;
    } catch {
      // La respuesta no era JSON
    }

    throw new Error(mensaje);
  }

  const archivo = await respuesta.blob();
  const url = URL.createObjectURL(archivo);

  const enlace = document.createElement("a");

  enlace.href = url;
  enlace.download = `comprobante-${codigo}.pdf`;

  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();

  URL.revokeObjectURL(url);
}