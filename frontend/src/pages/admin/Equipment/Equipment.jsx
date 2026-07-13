import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  LoaderCircle,
  Smartphone,
  Camera,
  ImagePlus,
  ExternalLink,
} from "lucide-react";

import { obtenerClientes } from "../../../services/clienteService";

import {
  obtenerEquipos,
  obtenerMarcas,
  obtenerModelosPorMarca,
  crearEquipo,
  actualizarEquipo,
  eliminarEquipo,
  obtenerFotosEquipo,
  subirFotoEquipo,
  eliminarFotoEquipo,
} from "../../../services/equipoService";

const formularioInicial = {
  idCliente: "",
  idMarca: "",
  idModelo: "",
  tipoDispositivo: "Celular",
  imei: "",
  numeroSerie: "",
  color: "",
  observaciones: "",
};

function Equipment() {
  const [equipos, setEquipos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);

  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [equipoEditando, setEquipoEditando] = useState(null);
  const [formulario, setFormulario] = useState(formularioInicial);

  const [modalFotos, setModalFotos] =
    useState(false);

  const [equipoFotos, setEquipoFotos] =
    useState(null);

  const [fotos, setFotos] = useState([]);

  const [archivoFoto, setArchivoFoto] =
    useState(null);

  const [tipoFoto, setTipoFoto] =
    useState("FRONTAL");

  const [descripcionFoto, setDescripcionFoto] =
    useState("");

  const [cargandoFotos, setCargandoFotos] =
    useState(false);

  const [subiendoFoto, setSubiendoFoto] =
    useState(false);

  const [imagenAmpliada, setImagenAmpliada] =
    useState(null);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      setCargando(true);

      const [datosEquipos, datosClientes, datosMarcas] =
        await Promise.all([
          obtenerEquipos(),
          obtenerClientes(),
          obtenerMarcas(),
        ]);

      setEquipos(datosEquipos);
      setClientes(datosClientes);
      setMarcas(datosMarcas);
    } catch (errorCarga) {
      setError(errorCarga.message);
    } finally {
      setCargando(false);
    }
  }

  const equiposFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    if (!texto) return equipos;

    return equipos.filter((equipo) => {
      return (
        equipo.CLIENTE?.toLowerCase().includes(texto) ||
        equipo.DNI?.includes(texto) ||
        equipo.MARCA?.toLowerCase().includes(texto) ||
        equipo.MODELO?.toLowerCase().includes(texto) ||
        equipo.IMEI?.includes(texto)
      );
    });
  }, [equipos, busqueda]);

  async function abrirNuevo() {
    setEquipoEditando(null);
    setFormulario(formularioInicial);
    setModelos([]);
    setError("");
    setModalAbierto(true);
  }

  async function abrirEditar(equipo) {
    setEquipoEditando(equipo);
    setError("");

    const modelosMarca = await obtenerModelosPorMarca(equipo.IDMARCA);
    setModelos(modelosMarca);

    setFormulario({
      idCliente: equipo.IDCLIENTE,
      idMarca: equipo.IDMARCA,
      idModelo: equipo.IDMODELO,
      tipoDispositivo: equipo.TIPO_DISPOSITIVO || "Celular",
      imei: equipo.IMEI || "",
      numeroSerie: equipo.NUMERO_SERIE || "",
      color: equipo.COLOR || "",
      observaciones: equipo.OBSERVACIONES || "",
    });

    setModalAbierto(true);
  }

  async function manejarCambio(evento) {
    const { name } = evento.target;
    let { value } = evento.target;

    if (name === "imei") {
      value = value.replace(/\D/g, "").slice(0, 15);
    }

    if (name === "numeroSerie") {
      value = value
        .replace(/[^a-zA-Z0-9ÁÉÍÓÚáéíóúÑñ\-_/]/g, "")
        .slice(0, 50);
    }

    if (name === "color") {
      value = value
        .replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñüÜ\s-]/g, "")
        .slice(0, 30);
    }

    if (name === "observaciones") {
      value = value.slice(0, 500);
    }

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));

    if (name === "idMarca") {
      setFormulario((anterior) => ({
        ...anterior,
        idMarca: value,
        idModelo: "",
      }));

      if (value) {
        const datosModelos =
          await obtenerModelosPorMarca(value);

        setModelos(datosModelos);
      } else {
        setModelos([]);
      }
    }
  }

  async function manejarGuardar(evento) {
    evento.preventDefault();
    if (!formulario.idCliente) {
  throw new Error("Selecciona un cliente");
  }

  if (!formulario.idMarca) {
    throw new Error("Selecciona una marca");
  }

  if (!formulario.idModelo) {
    throw new Error("Selecciona un modelo");
  }

  if (
    !["Celular", "Tablet"].includes(
      formulario.tipoDispositivo
    )
  ) {
    throw new Error("El tipo de dispositivo no es válido");
  }

  if (
    formulario.imei &&
    !/^\d{15}$/.test(formulario.imei)
  ) {
    throw new Error(
      "El IMEI debe contener exactamente 15 números"
    );
  }

  if (
    formulario.numeroSerie &&
    formulario.numeroSerie.length > 50
  ) {
    throw new Error(
      "El número de serie no puede superar los 50 caracteres"
    );
  }

  if (
    formulario.color &&
    !/^[a-zA-ZÁÉÍÓÚáéíóúÑñüÜ\s-]{2,30}$/.test(
      formulario.color
    )
  ) {
    throw new Error(
      "El color debe contener solo letras y tener entre 2 y 30 caracteres"
    );
  }

  if (formulario.observaciones.length > 500) {
    throw new Error(
      "Las observaciones no pueden superar los 500 caracteres"
    );
  }
    try {
      setGuardando(true);
      setError("");

      const datos = {
        ...formulario,
        idCliente: Number(formulario.idCliente),
        idMarca: Number(formulario.idMarca),
        idModelo: Number(formulario.idModelo),
      };

      if (equipoEditando) {
        await actualizarEquipo(equipoEditando.IDEQUIPO, datos);
      } else {
        await crearEquipo(datos);
      }

      await cargarDatos();
      setModalAbierto(false);
    } catch (errorGuardado) {
      setError(errorGuardado.message);
    } finally {
      setGuardando(false);
    }
  }

  async function manejarEliminar(equipo) {
    const confirmar = window.confirm(
      `¿Eliminar el equipo ${equipo.MARCA} ${equipo.MODELO}?`
    );

    if (!confirmar) return;

    try {
      await eliminarEquipo(equipo.IDEQUIPO);
      await cargarDatos();
    } catch (errorEliminacion) {
      setError(errorEliminacion.message);
    }
  }

  async function abrirFotos(equipo) {
    try {
      setEquipoFotos(equipo);
      setModalFotos(true);
      setCargandoFotos(true);
      setError("");
      setArchivoFoto(null);
      setTipoFoto("FRONTAL");
      setDescripcionFoto("");

      const datos = await obtenerFotosEquipo(
        equipo.IDEQUIPO
      );

      setFotos(datos);
    } catch (errorCarga) {
      setError(errorCarga.message);
    } finally {
      setCargandoFotos(false);
    }
  }

  async function recargarFotos() {
    const datos = await obtenerFotosEquipo(
      equipoFotos.IDEQUIPO
    );

    setFotos(datos);
  }

  async function guardarFoto(evento) {
    evento.preventDefault();

    try {
      setSubiendoFoto(true);
      setError("");

      if (!archivoFoto) {
        throw new Error(
          "Selecciona una imagen"
        );
      }

      const tiposPermitidos = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (
        !tiposPermitidos.includes(
          archivoFoto.type
        )
      ) {
        throw new Error(
          "Solo se permiten imágenes JPG, PNG o WEBP"
        );
      }

      if (
        archivoFoto.size >
        5 * 1024 * 1024
      ) {
        throw new Error(
          "La imagen no puede superar los 5 MB"
        );
      }

      if (descripcionFoto.length > 300) {
        throw new Error(
          "La descripción no puede superar los 300 caracteres"
        );
      }

      await subirFotoEquipo(
        equipoFotos.IDEQUIPO,
        {
          foto: archivoFoto,
          tipoFoto,
          descripcion:
            descripcionFoto.trim() || null,
        }
      );

      await recargarFotos();

      setArchivoFoto(null);
      setTipoFoto("FRONTAL");
      setDescripcionFoto("");

      const input = document.getElementById(
        "archivo-foto-equipo"
      );

      if (input) {
        input.value = "";
      }
    } catch (errorSubida) {
      setError(errorSubida.message);
    } finally {
      setSubiendoFoto(false);
    }
  }

  async function borrarFoto(foto) {
    const confirmar = window.confirm(
      "¿Deseas eliminar esta foto?"
    );

    if (!confirmar) return;

    try {
      setError("");

      await eliminarFotoEquipo(
        equipoFotos.IDEQUIPO,
        foto.IDFOTO
      );

      await recargarFotos();
    } catch (errorEliminar) {
      setError(errorEliminar.message);
    }
  }

  return (
    <section>
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-gray-500">
            Gestión administrativa
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Equipos
          </h1>

          <p className="mt-2 text-gray-600">
            Administra los celulares y tablets de los clientes.
          </p>
        </div>

        <button
          onClick={abrirNuevo}
          className="flex items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-3 font-semibold text-white hover:bg-red-800"
        >
          <Plus size={20} />
          Nuevo equipo
        </button>
      </div>

      {error && !modalAbierto && (
        <div className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              placeholder="Buscar cliente, DNI, marca, modelo o IMEI"
              className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 outline-none focus:border-red-600"
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Smartphone size={19} />
            {equiposFiltrados.length} equipos
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          {cargando ? (
            <div className="flex justify-center py-16">
              <LoaderCircle
                className="animate-spin text-red-700"
                size={38}
              />
            </div>
          ) : (
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b text-left text-sm text-gray-500">
                  <th className="pb-4">ID</th>
                  <th className="pb-4">Cliente</th>
                  <th className="pb-4">Equipo</th>
                  <th className="pb-4">Tipo</th>
                  <th className="pb-4">IMEI</th>
                  <th className="pb-4">Color</th>
                  <th className="pb-4 text-right">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {equiposFiltrados.map((equipo) => (
                  <tr
                    key={equipo.IDEQUIPO}
                    className="border-b border-gray-100"
                  >
                    <td className="py-4 font-semibold">
                      {equipo.IDEQUIPO}
                    </td>

                    <td className="py-4">
                      <p className="font-semibold">{equipo.CLIENTE}</p>
                      <p className="text-sm text-gray-500">
                        DNI: {equipo.DNI}
                      </p>
                    </td>

                    <td className="py-4">
                      {equipo.MARCA} {equipo.MODELO}
                    </td>

                    <td className="py-4">
                      {equipo.TIPO_DISPOSITIVO}
                    </td>

                    <td className="py-4">
                      {equipo.IMEI || "Sin IMEI"}
                    </td>

                    <td className="py-4">
                      {equipo.COLOR || "Sin color"}
                    </td>

                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => abrirFotos(equipo)}
                          title="Fotos del equipo"
                          className="rounded-lg bg-green-50 p-2 text-green-700 hover:bg-green-100"
                        >
                          <Camera size={18} />
                        </button>

                        <button
                          onClick={() => abrirEditar(equipo)}
                          title="Editar equipo"
                          className="rounded-lg bg-blue-50 p-2 text-blue-700"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          onClick={() => manejarEliminar(equipo)}
                          title="Eliminar equipo"
                          className="rounded-lg bg-red-50 p-2 text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {equiposFiltrados.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="py-16 text-center text-gray-500"
                    >
                      No se encontraron equipos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white">
            <div className="flex items-center justify-between border-b px-7 py-5">
              <h2 className="text-2xl font-bold">
                {equipoEditando
                  ? "Editar equipo"
                  : "Registrar equipo"}
              </h2>

              <button onClick={() => setModalAbierto(false)}>
                <X size={24} />
              </button>
            </div>

            <form
              onSubmit={manejarGuardar}
              className="grid gap-5 p-7 md:grid-cols-2"
            >
              <CampoSelect
                label="Cliente"
                name="idCliente"
                value={formulario.idCliente}
                onChange={manejarCambio}
                required
              >
                <option value="">Seleccionar cliente</option>

                {clientes.map((cliente) => (
                  <option
                    key={cliente.IDCLIENTE}
                    value={cliente.IDCLIENTE}
                  >
                    {cliente.NOMBRES} {cliente.APELLIDO_PATERNO}
                    {" - "}
                    {cliente.DNI}
                  </option>
                ))}
              </CampoSelect>

              <CampoSelect
                label="Tipo de dispositivo"
                name="tipoDispositivo"
                value={formulario.tipoDispositivo}
                onChange={manejarCambio}
              >
                <option value="Celular">Celular</option>
                <option value="Tablet">Tablet</option>
              </CampoSelect>

              <CampoSelect
                label="Marca"
                name="idMarca"
                value={formulario.idMarca}
                onChange={manejarCambio}
                required
              >
                <option value="">Seleccionar marca</option>

                {marcas.map((marca) => (
                  <option key={marca.IDMARCA} value={marca.IDMARCA}>
                    {marca.NOMBRE}
                  </option>
                ))}
              </CampoSelect>

              <CampoSelect
                label="Modelo"
                name="idModelo"
                value={formulario.idModelo}
                onChange={manejarCambio}
                required
              >
                <option value="">Seleccionar modelo</option>

                {modelos.map((modelo) => (
                  <option key={modelo.IDMODELO} value={modelo.IDMODELO}>
                    {modelo.NOMBRE}
                  </option>
                ))}
              </CampoSelect>

              <Campo
                label="IMEI"
                name="imei"
                value={formulario.imei}
                onChange={manejarCambio}
                inputMode="numeric"
                maxLength={15}
                placeholder="15 dígitos"
              />

              <Campo
                label="Número de serie"
                name="numeroSerie"
                value={formulario.numeroSerie}
                onChange={manejarCambio}
                maxLength={50}
                placeholder="Máximo 50 caracteres"
              />

              <Campo
                label="Color"
                name="color"
                value={formulario.color}
                onChange={manejarCambio}
                maxLength={30}
                placeholder="Ejemplo: Negro"
              />

              <div className="md:col-span-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">
                    Observaciones
                  </span>

                  <textarea
                    name="observaciones"
                    value={formulario.observaciones}
                    onChange={manejarCambio}
                    rows="4"
                    maxLength={500}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600"
                  />
                </label>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 p-4 text-red-700 md:col-span-2">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 border-t pt-5 md:col-span-2">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="rounded-xl border px-5 py-3 font-semibold"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={guardando}
                  className="flex items-center gap-2 rounded-xl bg-red-700 px-6 py-3 font-semibold text-white"
                >
                  {guardando && (
                    <LoaderCircle
                      size={19}
                      className="animate-spin"
                    />
                  )}

                  {guardando ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
                {modalFotos && (
                  <ModalFotosEquipo
                    equipo={equipoFotos}
                    fotos={fotos}
                    archivo={archivoFoto}
                    setArchivo={setArchivoFoto}
                    tipoFoto={tipoFoto}
                    setTipoFoto={setTipoFoto}
                    descripcion={descripcionFoto}
                    setDescripcion={setDescripcionFoto}
                    cargando={cargandoFotos}
                    subiendo={subiendoFoto}
                    error={error}
                    guardar={guardarFoto}
                    eliminar={borrarFoto}
                    ampliar={setImagenAmpliada}
                    cerrar={() => {
                      setModalFotos(false);
                      setEquipoFotos(null);
                      setFotos([]);
                      setArchivoFoto(null);
                      setError("");
                    }}
                  />
                )}

                {imagenAmpliada && (
                  <div
                    onClick={() => setImagenAmpliada(null)}
                    className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 p-5"
                  >
                    <button
                      type="button"
                      onClick={() => setImagenAmpliada(null)}
                      className="absolute right-5 top-5 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
                    >
                      <X size={28} />
                    </button>

                    <img
                      src={imagenAmpliada}
                      alt="Foto ampliada del equipo"
                      onClick={(evento) =>
                        evento.stopPropagation()
                      }
                      className="max-h-[90vh] max-w-full rounded-2xl object-contain"
                    />
                  </div>
                )}
    </section>
  );
}

function ModalFotosEquipo({
  equipo,
  fotos,
  archivo,
  setArchivo,
  tipoFoto,
  setTipoFoto,
  descripcion,
  setDescripcion,
  cargando,
  subiendo,
  error,
  guardar,
  eliminar,
  ampliar,
  cerrar,
}) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white">
        <div className="flex items-center justify-between border-b px-7 py-5">
          <div>
            <h2 className="text-2xl font-bold">
              Fotos del equipo
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {equipo?.MARCA}{" "}
              {equipo?.MODELO} —{" "}
              {equipo?.CLIENTE}
            </p>
          </div>

          <button
            type="button"
            onClick={cerrar}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        <form
          onSubmit={guardar}
          className="grid gap-5 border-b p-7 md:grid-cols-2"
        >
          <label>
            <span className="mb-2 block text-sm font-semibold">
              Tipo de foto *
            </span>

            <select
              value={tipoFoto}
              onChange={(evento) =>
                setTipoFoto(evento.target.value)
              }
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3"
            >
              <option value="FRONTAL">
                Frontal
              </option>

              <option value="POSTERIOR">
                Posterior
              </option>

              <option value="PANTALLA">
                Pantalla
              </option>

              <option value="DANO">
                Daño existente
              </option>

              <option value="OTRA">
                Otra
              </option>
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm font-semibold">
              Imagen *
            </span>

            <input
              id="archivo-foto-equipo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(evento) =>
                setArchivo(
                  evento.target.files?.[0] ||
                    null
                )
              }
              required
              className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-sm"
            />

            {archivo && (
              <p className="mt-2 text-xs text-gray-500">
                {archivo.name} —{" "}
                {(
                  archivo.size /
                  1024 /
                  1024
                ).toFixed(2)}{" "}
                MB
              </p>
            )}
          </label>

          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-semibold">
              Descripción
            </span>

            <textarea
              value={descripcion}
              onChange={(evento) =>
                setDescripcion(
                  evento.target.value.slice(
                    0,
                    300
                  )
                )
              }
              rows="3"
              maxLength={300}
              placeholder="Ejemplo: golpe en la esquina superior derecha"
              className="w-full rounded-xl border border-gray-300 px-4 py-3"
            />

            <p className="mt-1 text-right text-xs text-gray-500">
              {descripcion.length}/300
            </p>
          </label>

          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-red-700 md:col-span-2">
              {error}
            </div>
          )}

          <div className="flex justify-end md:col-span-2">
            <button
              type="submit"
              disabled={subiendo}
              className="flex items-center gap-2 rounded-xl bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-60"
            >
              {subiendo ? (
                <LoaderCircle
                  size={19}
                  className="animate-spin"
                />
              ) : (
                <ImagePlus size={19} />
              )}

              {subiendo
                ? "Subiendo..."
                : "Subir foto"}
            </button>
          </div>
        </form>

        <div className="p-7">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-bold">
              Evidencias registradas
            </h3>

            <span className="text-sm text-gray-500">
              {fotos.length} fotos
            </span>
          </div>

          {cargando ? (
            <div className="flex justify-center py-16">
              <LoaderCircle
                size={38}
                className="animate-spin text-red-700"
              />
            </div>
          ) : fotos.length === 0 ? (
            <div className="rounded-2xl bg-gray-50 py-16 text-center text-gray-500">
              No se han registrado fotos.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {fotos.map((foto) => (
                <article
                  key={foto.IDFOTO}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() =>
                      ampliar(foto.URL_FOTO)
                    }
                    className="group relative block h-52 w-full overflow-hidden bg-gray-100"
                  >
                    <img
                      src={foto.URL_FOTO}
                      alt={
                        foto.DESCRIPCION ||
                        foto.TIPO_FOTO
                      }
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />

                    <span className="absolute right-3 top-3 rounded-lg bg-black/60 p-2 text-white">
                      <ExternalLink size={17} />
                    </span>
                  </button>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          {formatearTipoFoto(
                            foto.TIPO_FOTO
                          )}
                        </span>

                        <p className="mt-3 text-sm text-gray-600">
                          {foto.DESCRIPCION ||
                            "Sin descripción"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          eliminar(foto)
                        }
                        title="Eliminar foto"
                        className="rounded-lg bg-red-50 p-2 text-red-700 hover:bg-red-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="mt-4 border-t pt-3 text-xs text-gray-500">
                      <p>
                        Subida por:{" "}
                        {foto.USUARIO}
                      </p>

                      <p className="mt-1">
                        {formatearFechaHora(
                          foto.FECHA_REGISTRO
                        )}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Campo({
  label,
  name,
  value,
  onChange,
  maxLength,
  inputMode,
  placeholder,
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold">
        {label}
      </span>

      <input
        name={name}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        inputMode={inputMode}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600"
      />

      {maxLength && (
        <p className="mt-1 text-right text-xs text-gray-500">
          {value.length}/{maxLength}
        </p>
      )}
    </label>
  );
}

function CampoSelect({
  label,
  name,
  value,
  onChange,
  children,
  required,
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold">
        {label}
      </span>

      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600"
      >
        {children}
      </select>
    </label>
  );
}

function formatearTipoFoto(tipo) {
  const nombres = {
    FRONTAL: "Frontal",
    POSTERIOR: "Posterior",
    PANTALLA: "Pantalla",
    DANO: "Daño existente",
    OTRA: "Otra",
  };

  return nombres[tipo] || tipo;
}

function formatearFechaHora(fecha) {
  if (!fecha) return "Sin fecha";

  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(fecha));
}

export default Equipment;