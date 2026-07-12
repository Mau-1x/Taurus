const API_URL = `${
  import.meta.env.VITE_API_URL || "http://localhost:3000"
}/api/auth`;

async function procesarRespuesta(respuesta) {
  const resultado = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      resultado.message || "No se pudo procesar la solicitud"
    );
  }

  return resultado;
}

export async function iniciarSesion(correo, password) {
  const respuesta = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      correo,
      password,
    }),
  });

  const resultado = await procesarRespuesta(respuesta);

  localStorage.setItem(
    "taurus_token",
    resultado.data.token
  );

  localStorage.setItem(
    "taurus_usuario",
    JSON.stringify(resultado.data.usuario)
  );

  return resultado.data;
}

export function obtenerToken() {
  return localStorage.getItem("taurus_token");
}

export function obtenerUsuario() {
  const usuario = localStorage.getItem("taurus_usuario");

  if (!usuario) return null;

  try {
    return JSON.parse(usuario);
  } catch {
    return null;
  }
}

export function cerrarSesion() {
  localStorage.removeItem("taurus_token");
  localStorage.removeItem("taurus_usuario");
}

export function estaAutenticado() {
  const token = obtenerToken();

  if (!token) return false;

  try {
    const payload = JSON.parse(
      atob(token.split(".")[1])
    );

    const expirado =
      !payload.exp ||
      payload.exp * 1000 <= Date.now();

    if (expirado) {
      cerrarSesion();
      return false;
    }

    return true;
  } catch {
    cerrarSesion();
    return false;
  }
}