const API_URL = "http://localhost:3000/api/productos";

async function procesarRespuesta(respuesta) {
  const resultado = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(resultado.message || "Ocurrió un error");
  }

  return resultado;
}

export async function obtenerProductos() {
  const respuesta = await fetch(API_URL);
  const resultado = await procesarRespuesta(respuesta);
  return resultado.data;
}

export async function obtenerCategorias() {
  const respuesta = await fetch(`${API_URL}/categorias`);
  const resultado = await procesarRespuesta(respuesta);
  return resultado.data;
}

export async function crearProducto(datos) {
  const respuesta = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datos),
  });

  return procesarRespuesta(respuesta);
}

export async function actualizarProducto(idProducto, datos) {
  const respuesta = await fetch(`${API_URL}/${idProducto}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datos),
  });

  return procesarRespuesta(respuesta);
}

export async function eliminarProducto(idProducto) {
  const respuesta = await fetch(`${API_URL}/${idProducto}`, {
    method: "DELETE",
  });

  return procesarRespuesta(respuesta);
}

export async function moverStock(idProducto, datos) {
  const respuesta = await fetch(`${API_URL}/${idProducto}/stock`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datos),
  });

  return procesarRespuesta(respuesta);
}

export async function obtenerMovimientos(idProducto) {
  const respuesta = await fetch(
    `${API_URL}/${idProducto}/movimientos`
  );

  const resultado = await procesarRespuesta(respuesta);
  return resultado.data;
}