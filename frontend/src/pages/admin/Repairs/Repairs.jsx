import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  RefreshCw,
  X,
  LoaderCircle,
  Wrench,
} from "lucide-react";

import { obtenerEquipos } from "../../../services/equipoService";

import {
  obtenerReparaciones,
  obtenerEstadosReparacion,
  crearReparacion,
  actualizarReparacion,
  cambiarEstadoReparacion,
} from "../../../services/reparacionAdminService";

const formularioInicial = {
  idEquipo: "",
  fallaReportada: "",
  diagnostico: "",
  solucion: "",
  costoEstimado: "",
  costoFinal: "",
  fechaEstimada: "",
  fechaEntrega: "",
  garantiaDias: 0,
  observaciones: "",
};

function Repairs() {
  const [reparaciones, setReparaciones] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [estados, setEstados] = useState([]);

  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalEstado, setModalEstado] = useState(false);

  const [reparacionEditando, setReparacionEditando] =
    useState(null);

  const [reparacionEstado, setReparacionEstado] =
    useState(null);

  const [formulario, setFormulario] =
    useState(formularioInicial);

  const [estadoSeleccionado, setEstadoSeleccionado] =
    useState("");

  const [comentarioEstado, setComentarioEstado] =
    useState("");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      setCargando(true);
      setError("");

      const [
        datosReparaciones,
        datosEquipos,
        datosEstados,
      ] = await Promise.all([
        obtenerReparaciones(),
        obtenerEquipos(),
        obtenerEstadosReparacion(),
      ]);

      setReparaciones(datosReparaciones);
      setEquipos(datosEquipos);
      setEstados(datosEstados);
    } catch (errorCarga) {
      setError(errorCarga.message);
    } finally {
      setCargando(false);
    }
  }

  const reparacionesFiltradas = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    if (!texto) return reparaciones;

    return reparaciones.filter((reparacion) => {
      return (
        reparacion.CODIGO?.toLowerCase().includes(texto) ||
        reparacion.CLIENTE?.toLowerCase().includes(texto) ||
        reparacion.DNI?.includes(texto) ||
        reparacion.MARCA?.toLowerCase().includes(texto) ||
        reparacion.MODELO?.toLowerCase().includes(texto) ||
        reparacion.ESTADO_REPARACION?.toLowerCase().includes(texto)
      );
    });
  }, [reparaciones, busqueda]);

  function abrirNuevaReparacion() {
    setReparacionEditando(null);
    setFormulario(formularioInicial);
    setError("");
    setModalAbierto(true);
  }

  function abrirEditar(reparacion) {
    setReparacionEditando(reparacion);

    setFormulario({
      idEquipo: reparacion.IDEQUIPO,
      fallaReportada: reparacion.FALLA_REPORTADA || "",
      diagnostico: reparacion.DIAGNOSTICO || "",
      solucion: reparacion.SOLUCION || "",
      costoEstimado: reparacion.COSTO_ESTIMADO || "",
      costoFinal: reparacion.COSTO_FINAL || "",
      fechaEstimada: formatearInputFecha(
        reparacion.FECHA_ESTIMADA
      ),
      fechaEntrega: formatearInputFecha(
        reparacion.FECHA_ENTREGA
      ),
      garantiaDias: reparacion.GARANTIA_DIAS || 0,
      observaciones: reparacion.OBSERVACIONES || "",
    });

    setError("");
    setModalAbierto(true);
  }

  function abrirCambioEstado(reparacion) {
    setReparacionEstado(reparacion);
    setEstadoSeleccionado(reparacion.IDESTADO);
    setComentarioEstado("");
    setError("");
    setModalEstado(true);
  }

  function manejarCambio(evento) {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  async function manejarGuardar(evento) {
    evento.preventDefault();

    try {
      setGuardando(true);
      setError("");

      const datos = {
        ...formulario,
        idEquipo: Number(formulario.idEquipo),
        costoEstimado: formulario.costoEstimado
          ? Number(formulario.costoEstimado)
          : null,
        costoFinal: formulario.costoFinal
          ? Number(formulario.costoFinal)
          : null,
        garantiaDias: Number(formulario.garantiaDias || 0),
        fechaEstimada:
          formulario.fechaEstimada || null,
        fechaEntrega:
          formulario.fechaEntrega || null,
      };

      if (reparacionEditando) {
        await actualizarReparacion(
          reparacionEditando.IDREPARACION,
          datos
        );
      } else {
        await crearReparacion(datos);
      }

      await cargarDatos();
      setModalAbierto(false);
    } catch (errorGuardado) {
      setError(errorGuardado.message);
    } finally {
      setGuardando(false);
    }
  }

  async function guardarCambioEstado(evento) {
    evento.preventDefault();

    try {
      setGuardando(true);
      setError("");

      await cambiarEstadoReparacion(
        reparacionEstado.IDREPARACION,
        {
          idEstado: Number(estadoSeleccionado),
          comentario: comentarioEstado || null,
        }
      );

      await cargarDatos();
      setModalEstado(false);
    } catch (errorGuardado) {
      setError(errorGuardado.message);
    } finally {
      setGuardando(false);
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
            Reparaciones
          </h1>

          <p className="mt-2 text-gray-600">
            Registra diagnósticos y controla el estado de los equipos.
          </p>
        </div>

        <button
          onClick={abrirNuevaReparacion}
          className="flex items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-3 font-semibold text-white hover:bg-red-800"
        >
          <Plus size={20} />
          Nueva reparación
        </button>
      </div>

      {error && !modalAbierto && !modalEstado && (
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
              onChange={(evento) =>
                setBusqueda(evento.target.value)
              }
              placeholder="Buscar código, cliente, equipo o estado"
              className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 outline-none focus:border-red-600"
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Wrench size={19} />
            {reparacionesFiltradas.length} reparaciones
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          {cargando ? (
            <div className="flex justify-center py-16">
              <LoaderCircle
                size={38}
                className="animate-spin text-red-700"
              />
            </div>
          ) : (
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b text-left text-sm text-gray-500">
                  <th className="pb-4">Código</th>
                  <th className="pb-4">Cliente</th>
                  <th className="pb-4">Equipo</th>
                  <th className="pb-4">Falla</th>
                  <th className="pb-4">Estado</th>
                  <th className="pb-4">Costo</th>
                  <th className="pb-4">Ingreso</th>
                  <th className="pb-4 text-right">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {reparacionesFiltradas.map((reparacion) => (
                  <tr
                    key={reparacion.IDREPARACION}
                    className="border-b border-gray-100"
                  >
                    <td className="py-4 font-semibold">
                      {reparacion.CODIGO}
                    </td>

                    <td className="py-4">
                      <p className="font-semibold">
                        {reparacion.CLIENTE}
                      </p>
                      <p className="text-sm text-gray-500">
                        DNI: {reparacion.DNI}
                      </p>
                    </td>

                    <td className="py-4">
                      {reparacion.MARCA}{" "}
                      {reparacion.MODELO}
                    </td>

                    <td className="max-w-[250px] py-4">
                      <p className="truncate">
                        {reparacion.FALLA_REPORTADA}
                      </p>
                    </td>

                    <td className="py-4">
                      <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                        {reparacion.ESTADO_REPARACION}
                      </span>
                    </td>

                    <td className="py-4">
                      {reparacion.COSTO_FINAL
                        ? `S/ ${Number(
                            reparacion.COSTO_FINAL
                          ).toFixed(2)}`
                        : reparacion.COSTO_ESTIMADO
                          ? `S/ ${Number(
                              reparacion.COSTO_ESTIMADO
                            ).toFixed(2)}`
                          : "Sin costo"}
                    </td>

                    <td className="py-4">
                      {formatearFecha(
                        reparacion.FECHA_INGRESO
                      )}
                    </td>

                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            abrirCambioEstado(reparacion)
                          }
                          title="Cambiar estado"
                          className="rounded-lg bg-amber-50 p-2 text-amber-700"
                        >
                          <RefreshCw size={18} />
                        </button>

                        <button
                          onClick={() =>
                            abrirEditar(reparacion)
                          }
                          title="Editar reparación"
                          className="rounded-lg bg-blue-50 p-2 text-blue-700"
                        >
                          <Pencil size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {reparacionesFiltradas.length === 0 && (
                  <tr>
                    <td
                      colSpan="8"
                      className="py-16 text-center text-gray-500"
                    >
                      No se encontraron reparaciones.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalAbierto && (
        <ModalReparacion
          formulario={formulario}
          equipos={equipos}
          reparacionEditando={reparacionEditando}
          guardando={guardando}
          error={error}
          manejarCambio={manejarCambio}
          manejarGuardar={manejarGuardar}
          cerrar={() => setModalAbierto(false)}
        />
      )}

      {modalEstado && (
        <ModalEstado
          reparacion={reparacionEstado}
          estados={estados}
          estadoSeleccionado={estadoSeleccionado}
          setEstadoSeleccionado={setEstadoSeleccionado}
          comentario={comentarioEstado}
          setComentario={setComentarioEstado}
          guardando={guardando}
          error={error}
          guardar={guardarCambioEstado}
          cerrar={() => setModalEstado(false)}
        />
      )}
    </section>
  );
}

function ModalReparacion({
  formulario,
  equipos,
  reparacionEditando,
  guardando,
  error,
  manejarCambio,
  manejarGuardar,
  cerrar,
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white">
        <div className="flex items-center justify-between border-b px-7 py-5">
          <h2 className="text-2xl font-bold">
            {reparacionEditando
              ? "Editar reparación"
              : "Registrar reparación"}
          </h2>

          <button onClick={cerrar}>
            <X size={24} />
          </button>
        </div>

        <form
          onSubmit={manejarGuardar}
          className="grid gap-5 p-7 md:grid-cols-2"
        >
          {!reparacionEditando && (
            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-semibold">
                Equipo *
              </span>

              <select
                name="idEquipo"
                value={formulario.idEquipo}
                onChange={manejarCambio}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3"
              >
                <option value="">Seleccionar equipo</option>

                {equipos.map((equipo) => (
                  <option
                    key={equipo.IDEQUIPO}
                    value={equipo.IDEQUIPO}
                  >
                    {equipo.CLIENTE} - {equipo.MARCA}{" "}
                    {equipo.MODELO}
                  </option>
                ))}
              </select>
            </label>
          )}

          <Area
            label="Falla reportada"
            name="fallaReportada"
            value={formulario.fallaReportada}
            onChange={manejarCambio}
            required
          />

          <Area
            label="Diagnóstico"
            name="diagnostico"
            value={formulario.diagnostico}
            onChange={manejarCambio}
          />

          <Area
            label="Solución"
            name="solucion"
            value={formulario.solucion}
            onChange={manejarCambio}
          />

          <Area
            label="Observaciones"
            name="observaciones"
            value={formulario.observaciones}
            onChange={manejarCambio}
          />

          <Campo
            label="Costo estimado"
            name="costoEstimado"
            type="number"
            value={formulario.costoEstimado}
            onChange={manejarCambio}
          />

          <Campo
            label="Costo final"
            name="costoFinal"
            type="number"
            value={formulario.costoFinal}
            onChange={manejarCambio}
          />

          <Campo
            label="Fecha estimada"
            name="fechaEstimada"
            type="datetime-local"
            value={formulario.fechaEstimada}
            onChange={manejarCambio}
          />

          <Campo
            label="Fecha de entrega"
            name="fechaEntrega"
            type="datetime-local"
            value={formulario.fechaEntrega}
            onChange={manejarCambio}
          />

          <Campo
            label="Días de garantía"
            name="garantiaDias"
            type="number"
            value={formulario.garantiaDias}
            onChange={manejarCambio}
          />

          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-red-700 md:col-span-2">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t pt-5 md:col-span-2">
            <button
              type="button"
              onClick={cerrar}
              className="rounded-xl border px-5 py-3 font-semibold"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={guardando}
              className="rounded-xl bg-red-700 px-6 py-3 font-semibold text-white"
            >
              {guardando ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ModalEstado({
  reparacion,
  estados,
  estadoSeleccionado,
  setEstadoSeleccionado,
  comentario,
  setComentario,
  guardando,
  error,
  guardar,
  cerrar,
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <form
        onSubmit={guardar}
        className="w-full max-w-lg rounded-3xl bg-white p-7"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              Cambiar estado
            </h2>
            <p className="mt-1 text-gray-500">
              {reparacion.CODIGO}
            </p>
          </div>

          <button type="button" onClick={cerrar}>
            <X size={24} />
          </button>
        </div>

        <label className="mt-6 block">
          <span className="mb-2 block text-sm font-semibold">
            Nuevo estado
          </span>

          <select
            value={estadoSeleccionado}
            onChange={(evento) =>
              setEstadoSeleccionado(evento.target.value)
            }
            required
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
          >
            {estados.map((estado) => (
              <option
                key={estado.IDESTADO}
                value={estado.IDESTADO}
              >
                {estado.NOMBRE}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-semibold">
            Comentario
          </span>

          <textarea
            value={comentario}
            onChange={(evento) =>
              setComentario(evento.target.value)
            }
            rows="4"
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
          />
        </label>

        {error && (
          <div className="mt-5 rounded-xl bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={cerrar}
            className="rounded-xl border px-5 py-3 font-semibold"
          >
            Cancelar
          </button>

          <button
            disabled={guardando}
            className="rounded-xl bg-red-700 px-6 py-3 font-semibold text-white"
          >
            {guardando ? "Guardando..." : "Actualizar estado"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Campo({
  label,
  name,
  value,
  onChange,
  type = "text",
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold">
        {label}
      </span>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        step={type === "number" ? "0.01" : undefined}
        className="w-full rounded-xl border border-gray-300 px-4 py-3"
      />
    </label>
  );
}

function Area({
  label,
  name,
  value,
  onChange,
  required = false,
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold">
        {label}
      </span>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        rows="4"
        className="w-full rounded-xl border border-gray-300 px-4 py-3"
      />
    </label>
  );
}

function formatearFecha(fecha) {
  if (!fecha) return "Sin fecha";

  return new Intl.DateTimeFormat("es-PE").format(
    new Date(fecha)
  );
}

function formatearInputFecha(fecha) {
  if (!fecha) return "";

  const fechaLocal = new Date(fecha);
  fechaLocal.setMinutes(
    fechaLocal.getMinutes() -
      fechaLocal.getTimezoneOffset()
  );

  return fechaLocal.toISOString().slice(0, 16);
}

export default Repairs;