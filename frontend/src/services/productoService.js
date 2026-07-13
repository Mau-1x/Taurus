import { apiFetch } from "./apiClient";

const API_URL = `${
  import.meta.env.VITE_API_URL || "http://localhost:3000"
}/api/productos`;

async function procesarRespuesta(respuesta) {
  const resultado = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      resultado.message || "Ocurrió un error"
    );
  }

  return resultado;
}

export async function obtenerProductos(
  filtros = {}
) {
  const parametros = new URLSearchParams();

  if (filtros.idMarca) {
    parametros.set("idMarca", filtros.idMarca);
  }

  if (filtros.idModelo) {
    parametros.set("idModelo", filtros.idModelo);
  }

  const consulta = parametros.toString();

  const respuesta = await apiFetch(
    consulta
      ? `${API_URL}?${consulta}`
      : API_URL
  );

  const resultado =
    await procesarRespuesta(respuesta);

  return resultado.data;
}

export async function obtenerCategorias() {
  const respuesta = await apiFetch(
    `${API_URL}/categorias`
  );

  const resultado =
    await procesarRespuesta(respuesta);

  return resultado.data;
}

export async function obtenerMarcas() {
  const respuesta = await apiFetch(
    `${API_URL}/marcas`
  );

  const resultado =
    await procesarRespuesta(respuesta);

  return resultado.data;
}

export async function obtenerModelos(
  idMarca = ""
) {
  const parametros = new URLSearchParams();

  if (idMarca) {
    parametros.set("idMarca", idMarca);
  }

  const consulta = parametros.toString();

  const respuesta = await apiFetch(
    consulta
      ? `${API_URL}/modelos?${consulta}`
      : `${API_URL}/modelos`
  );

  const resultado =
    await procesarRespuesta(respuesta);

  return resultado.data;
}

export async function obtenerCompatibilidades(
  idProducto
) {
  const respuesta = await apiFetch(
    `${API_URL}/${idProducto}/compatibilidades`
  );

  const resultado =
    await procesarRespuesta(respuesta);

  return resultado.data;
}

export async function actualizarCompatibilidades(
  idProducto,
  idsModelos
) {
  const respuesta = await apiFetch(
    `${API_URL}/${idProducto}/compatibilidades`,
    {
      method: "PUT",
      body: JSON.stringify({
        idsModelos,
      }),
    }
  );

  return procesarRespuesta(respuesta);
}

export async function crearProducto(datos) {
  const respuesta = await apiFetch(API_URL, {
    method: "POST",
    body: JSON.stringify(datos),
  });

  return procesarRespuesta(respuesta);
}

export async function actualizarProducto(
  idProducto,
  datos
) {
  const respuesta = await apiFetch(
    `${API_URL}/${idProducto}`,
    {
      method: "PUT",
      body: JSON.stringify(datos),
    }
  );

  return procesarRespuesta(respuesta);
}

export async function eliminarProducto(
  idProducto
) {
  const respuesta = await apiFetch(
    `${API_URL}/${idProducto}`,
    {
      method: "DELETE",
    }
  );

  return procesarRespuesta(respuesta);
}

export async function moverStock(
  idProducto,
  datos
) {
  const respuesta = await apiFetch(
    `${API_URL}/${idProducto}/stock`,
    {
      method: "PATCH",
      body: JSON.stringify(datos),
    }
  );

  return procesarRespuesta(respuesta);
}

export async function obtenerMovimientos(
  idProducto
) {
  const respuesta = await apiFetch(
    `${API_URL}/${idProducto}/movimientos`
  );

  const resultado =
    await procesarRespuesta(respuesta);

  return resultado.data;
}

export async function importarModelos(filas) {
  const respuesta = await apiFetch(
    `${API_URL}/importar-modelos`,
    {
      method: "POST",
      body: JSON.stringify({
        filas,
      }),
    }
  );

  return procesarRespuesta(respuesta);
}