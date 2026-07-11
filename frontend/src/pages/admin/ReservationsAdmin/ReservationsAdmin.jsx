import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Search,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  X,
  LoaderCircle,
} from "lucide-react";

import {
  obtenerReservas,
  actualizarReserva,
  cambiarEstadoReserva,
  eliminarReserva,
} from "../../../services/reservaService";

const formularioInicial = {
  idCliente: "",
  nombreCliente: "",
  celular: "",
  correo: "",
  servicio: "",
  descripcion: "",
  fechaReserva: "",
  horaReserva: "",
  observaciones: "",
};

function ReservationsAdmin() {
  const [reservas, setReservas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");

  const [modalEditar, setModalEditar] = useState(false);
  const [reservaEditando, setReservaEditando] = useState(null);
  const [formulario, setFormulario] = useState(formularioInicial);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarReservas();
  }, []);

  async function cargarReservas() {
    try {
      setCargando(true);
      setError("");

      const datos = await obtenerReservas();
      setReservas(datos);
    } catch (errorCarga) {
      setError(errorCarga.message);
    } finally {
      setCargando(false);
    }
  }

  const reservasFiltradas = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    return reservas.filter((reserva) => {
      const coincideTexto =
        !texto ||
        reserva.NOMBRE_CLIENTE?.toLowerCase().includes(texto) ||
        reserva.CELULAR?.includes(texto) ||
        reserva.CORREO?.toLowerCase().includes(texto) ||
        reserva.SERVICIO?.toLowerCase().includes(texto);

      const coincideEstado =
        !filtroEstado || reserva.ESTADO === filtroEstado;

      return coincideTexto && coincideEstado;
    });
  }, [reservas, busqueda, filtroEstado]);

  const resumen = useMemo(() => {
    return {
      pendientes: reservas.filter(
        (reserva) => reserva.ESTADO === "PENDIENTE"
      ).length,
      confirmadas: reservas.filter(
        (reserva) => reserva.ESTADO === "CONFIRMADA"
      ).length,
      atendidas: reservas.filter(
        (reserva) => reserva.ESTADO === "ATENDIDA"
      ).length,
      canceladas: reservas.filter(
        (reserva) => reserva.ESTADO === "CANCELADA"
      ).length,
    };
  }, [reservas]);

  function abrirEditar(reserva) {
    setReservaEditando(reserva);

    setFormulario({
      idCliente: reserva.IDCLIENTE || "",
      nombreCliente: reserva.NOMBRE_CLIENTE || "",
      celular: reserva.CELULAR || "",
      correo: reserva.CORREO || "",
      servicio: reserva.SERVICIO || "",
      descripcion: reserva.DESCRIPCION || "",
      fechaReserva: formatearFechaInput(reserva.FECHA_RESERVA),
      horaReserva: formatearHoraInput(reserva.HORA_RESERVA),
      observaciones: reserva.OBSERVACIONES || "",
    });

    setError("");
    setModalEditar(true);
  }

  function manejarCambio(evento) {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  async function guardarEdicion(evento) {
    evento.preventDefault();

    try {
      setGuardando(true);
      setError("");

      await actualizarReserva(
        reservaEditando.IDRESERVA,
        {
          ...formulario,
          idCliente: formulario.idCliente
            ? Number(formulario.idCliente)
            : null,
          correo: formulario.correo || null,
          descripcion: formulario.descripcion || null,
          observaciones:
            formulario.observaciones || null,
        }
      );

      await cargarReservas();
      setModalEditar(false);
    } catch (errorGuardado) {
      setError(errorGuardado.message);
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarEstado(reserva, estado) {
    try {
      setError("");

      await cambiarEstadoReserva(
        reserva.IDRESERVA,
        estado
      );

      await cargarReservas();
    } catch (errorEstado) {
      setError(errorEstado.message);
    }
  }

  async function manejarEliminar(reserva) {
    const confirmar = window.confirm(
      `¿Deseas eliminar la reserva de ${reserva.NOMBRE_CLIENTE}?`
    );

    if (!confirmar) return;

    try {
      await eliminarReserva(reserva.IDRESERVA);
      await cargarReservas();
    } catch (errorEliminacion) {
      setError(errorEliminacion.message);
    }
  }

  return (
    <section>
      <div>
        <p className="text-sm text-gray-500">
          Gestión administrativa
        </p>

        <h1 className="mt-1 text-3xl font-bold text-gray-900">
          Reservas
        </h1>

        <p className="mt-2 text-gray-600">
          Confirma, reprograma y administra las citas.
        </p>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Tarjeta
          titulo="Pendientes"
          valor={resumen.pendientes}
          icono={Clock}
          clase="bg-amber-100 text-amber-700"
        />

        <Tarjeta
          titulo="Confirmadas"
          valor={resumen.confirmadas}
          icono={CheckCircle2}
          clase="bg-blue-100 text-blue-700"
        />

        <Tarjeta
          titulo="Atendidas"
          valor={resumen.atendidas}
          icono={UserCheck}
          clase="bg-green-100 text-green-700"
        />

        <Tarjeta
          titulo="Canceladas"
          valor={resumen.canceladas}
          icono={XCircle}
          clase="bg-red-100 text-red-700"
        />
      </div>

      {error && !modalEditar && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={busqueda}
              onChange={(evento) =>
                setBusqueda(evento.target.value)
              }
              placeholder="Buscar cliente, celular, correo o servicio"
              className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 outline-none focus:border-red-600"
            />
          </div>

          <select
            value={filtroEstado}
            onChange={(evento) =>
              setFiltroEstado(evento.target.value)
            }
            className="rounded-xl border border-gray-300 px-4 py-3"
          >
            <option value="">Todos los estados</option>
            <option value="PENDIENTE">Pendientes</option>
            <option value="CONFIRMADA">Confirmadas</option>
            <option value="ATENDIDA">Atendidas</option>
            <option value="CANCELADA">Canceladas</option>
          </select>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <CalendarDays size={19} />
            {reservasFiltradas.length} reservas
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
            <table className="w-full min-w-[1200px]">
              <thead>
                <tr className="border-b text-left text-sm text-gray-500">
                  <th className="pb-4">Cliente</th>
                  <th className="pb-4">Contacto</th>
                  <th className="pb-4">Servicio</th>
                  <th className="pb-4">Fecha</th>
                  <th className="pb-4">Hora</th>
                  <th className="pb-4">Estado</th>
                  <th className="pb-4 text-right">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {reservasFiltradas.map((reserva) => (
                  <tr
                    key={reserva.IDRESERVA}
                    className="border-b border-gray-100"
                  >
                    <td className="py-4">
                      <p className="font-semibold text-gray-900">
                        {reserva.NOMBRE_CLIENTE}
                      </p>

                      <p className="text-sm text-gray-500">
                        Reserva #{reserva.IDRESERVA}
                      </p>
                    </td>

                    <td className="py-4">
                      <p>{reserva.CELULAR}</p>

                      <p className="text-sm text-gray-500">
                        {reserva.CORREO || "Sin correo"}
                      </p>
                    </td>

                    <td className="py-4">
                      <p className="font-semibold">
                        {reserva.SERVICIO}
                      </p>

                      <p className="max-w-[260px] truncate text-sm text-gray-500">
                        {reserva.DESCRIPCION ||
                          "Sin descripción"}
                      </p>
                    </td>

                    <td className="py-4">
                      {formatearFecha(
                        reserva.FECHA_RESERVA
                      )}
                    </td>

                    <td className="py-4">
                      {formatearHora(
                        reserva.HORA_RESERVA
                      )}
                    </td>

                    <td className="py-4">
                      <EstadoReserva
                        estado={reserva.ESTADO}
                      />
                    </td>

                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        {reserva.ESTADO === "PENDIENTE" && (
                          <button
                            onClick={() =>
                              cambiarEstado(
                                reserva,
                                "CONFIRMADA"
                              )
                            }
                            title="Confirmar"
                            className="rounded-lg bg-blue-50 p-2 text-blue-700"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                        )}

                        {reserva.ESTADO === "CONFIRMADA" && (
                          <button
                            onClick={() =>
                              cambiarEstado(
                                reserva,
                                "ATENDIDA"
                              )
                            }
                            title="Marcar como atendida"
                            className="rounded-lg bg-green-50 p-2 text-green-700"
                          >
                            <UserCheck size={18} />
                          </button>
                        )}

                        {reserva.ESTADO !== "CANCELADA" &&
                          reserva.ESTADO !== "ATENDIDA" && (
                            <button
                              onClick={() =>
                                cambiarEstado(
                                  reserva,
                                  "CANCELADA"
                                )
                              }
                              title="Cancelar"
                              className="rounded-lg bg-amber-50 p-2 text-amber-700"
                            >
                              <XCircle size={18} />
                            </button>
                          )}

                        <button
                          onClick={() => abrirEditar(reserva)}
                          title="Editar o reprogramar"
                          className="rounded-lg bg-blue-50 p-2 text-blue-700"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          onClick={() =>
                            manejarEliminar(reserva)
                          }
                          title="Eliminar"
                          className="rounded-lg bg-red-50 p-2 text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {reservasFiltradas.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="py-16 text-center text-gray-500"
                    >
                      No se encontraron reservas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalEditar && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white">
            <div className="flex items-center justify-between border-b px-7 py-5">
              <div>
                <h2 className="text-2xl font-bold">
                  Editar reserva
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Modifica los datos o reprograma la cita.
                </p>
              </div>

              <button
                onClick={() => setModalEditar(false)}
              >
                <X size={24} />
              </button>
            </div>

            <form
              onSubmit={guardarEdicion}
              className="grid gap-5 p-7 md:grid-cols-2"
            >
              <Campo
                label="Nombre completo"
                name="nombreCliente"
                value={formulario.nombreCliente}
                onChange={manejarCambio}
                required
              />

              <Campo
                label="Celular"
                name="celular"
                value={formulario.celular}
                onChange={manejarCambio}
                required
              />

              <Campo
                label="Correo"
                name="correo"
                type="email"
                value={formulario.correo}
                onChange={manejarCambio}
              />

              <Campo
                label="Servicio"
                name="servicio"
                value={formulario.servicio}
                onChange={manejarCambio}
                required
              />

              <Campo
                label="Fecha"
                name="fechaReserva"
                type="date"
                value={formulario.fechaReserva}
                onChange={manejarCambio}
                required
              />

              <Campo
                label="Hora"
                name="horaReserva"
                type="time"
                value={formulario.horaReserva}
                onChange={manejarCambio}
                required
              />

              <Area
                label="Descripción"
                name="descripcion"
                value={formulario.descripcion}
                onChange={manejarCambio}
              />

              <Area
                label="Observaciones"
                name="observaciones"
                value={formulario.observaciones}
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
                  onClick={() => setModalEditar(false)}
                  className="rounded-xl border px-5 py-3 font-semibold"
                >
                  Cancelar
                </button>

                <button
                  disabled={guardando}
                  className="rounded-xl bg-red-700 px-6 py-3 font-semibold text-white disabled:opacity-60"
                >
                  {guardando
                    ? "Guardando..."
                    : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

function Tarjeta({ titulo, valor, icono: Icono, clase }) {
  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm">
      <div className={`inline-flex rounded-xl p-3 ${clase}`}>
        <Icono size={23} />
      </div>

      <p className="mt-4 text-sm text-gray-500">
        {titulo}
      </p>

      <p className="mt-1 text-3xl font-bold text-gray-900">
        {valor}
      </p>
    </article>
  );
}

function EstadoReserva({ estado }) {
  const clases = {
    PENDIENTE: "bg-amber-100 text-amber-700",
    CONFIRMADA: "bg-blue-100 text-blue-700",
    ATENDIDA: "bg-green-100 text-green-700",
    CANCELADA: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-semibold ${
        clases[estado] || "bg-gray-100 text-gray-700"
      }`}
    >
      {estado}
    </span>
  );
}

function Campo({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </span>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600"
      />
    </label>
  );
}

function Area({
  label,
  name,
  value,
  onChange,
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </span>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows="4"
        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600"
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

function formatearFechaInput(fecha) {
  if (!fecha) return "";

  return new Date(fecha).toISOString().split("T")[0];
}

function formatearHora(hora) {
  if (!hora) return "Sin hora";

  if (typeof hora === "string") {
    return hora.substring(0, 5);
  }

  return new Intl.DateTimeFormat("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(hora));
}

function formatearHoraInput(hora) {
  if (!hora) return "";

  if (typeof hora === "string") {
    return hora.substring(0, 5);
  }

  const fecha = new Date(hora);

  return `${String(fecha.getHours()).padStart(2, "0")}:${String(
    fecha.getMinutes()
  ).padStart(2, "0")}`;
}

export default ReservationsAdmin;