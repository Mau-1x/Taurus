const API_URL = "http://localhost:3000/api/clientes";

async function procesarRespuesta(respuesta) {
  const resultado = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(resultado.message || "Ocurrió un error");
  }

  return resultado;
}

export async function obtenerClientes() {
  const respuesta = await fetch(API_URL);
  const resultado = await procesarRespuesta(respuesta);
  return resultado.data;
}

export async function crearCliente(datos) {
  const respuesta = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datos),
  });

  return procesarRespuesta(respuesta);
}

export async function actualizarCliente(idCliente, datos) {
  const respuesta = await fetch(`${API_URL}/${idCliente}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datos),
  });

  return procesarRespuesta(respuesta);
}

export async function eliminarCliente(idCliente) {
  const respuesta = await fetch(`${API_URL}/${idCliente}`, {
    method: "DELETE",
  });

  return procesarRespuesta(respuesta);
}