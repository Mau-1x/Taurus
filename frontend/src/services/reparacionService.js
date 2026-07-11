const API_URL = "http://localhost:3000/api/reparaciones";

export async function buscarReparacionPorCodigo(codigo) {
  const respuesta = await fetch(
    `${API_URL}/codigo/${encodeURIComponent(codigo)}`
  );

  const resultado = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      resultado.message || "No se pudo consultar la reparación"
    );
  }

  return resultado.data;
}