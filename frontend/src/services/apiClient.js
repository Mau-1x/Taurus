import {
  obtenerToken,
  cerrarSesion,
} from "./authService";

export async function apiFetch(url, opciones = {}) {
  const token = obtenerToken();

  const headers = {
    ...(opciones.body
      ? { "Content-Type": "application/json" }
      : {}),
    ...opciones.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const respuesta = await fetch(url, {
    ...opciones,
    headers,
  });

  if (respuesta.status === 401) {
    cerrarSesion();

    if (window.location.pathname.startsWith("/admin")) {
      window.location.href = "/login";
    }
  }

  return respuesta;
}