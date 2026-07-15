import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  LoaderCircle,
  Users,
  History,
  Smartphone,
  Wrench,
  Wallet,
  Images,
  CircleDollarSign,
  CalendarDays,
  ExternalLink,
  AlertCircle,
} from "lucide-react";

import {
  obtenerClientes,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
  obtenerHistorialCliente,
} from "../../../services/clienteService";

const formularioInicial = {
  dni: "",
  nombres: "",
  apellidoPaterno: "",
  apellidoMaterno: "",
  celular: "",
  email: "",
  direccion: "",
};

function Clients() {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const [modalHistorial, setModalHistorial] =
    useState(false);

  const [clienteHistorial, setClienteHistorial] =
    useState(null);

  const [historial, setHistorial] =
    useState(null);

  const [cargandoHistorial, setCargandoHistorial] =
    useState(false);

  const [errorHistorial, setErrorHistorial] =
    useState("");

  useEffect(() => {
    cargarClientes();
  }, []);

  async function cargarClientes() {
    try {
      setCargando(true);
      setError("");

      const datos = await obtenerClientes();
      setClientes(datos);
    } catch (errorCarga) {
      setError(errorCarga.message);
    } finally {
      setCargando(false);
    }
  }

  const clientesFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    if (!texto) return clientes;

    return clientes.filter((cliente) => {
      const nombreCompleto = `
        ${cliente.NOMBRES}
        ${cliente.APELLIDO_PATERNO}
        ${cliente.APELLIDO_MATERNO || ""}
      `.toLowerCase();

      return (
        nombreCompleto.includes(texto) ||
        cliente.DNI?.includes(texto) ||
        cliente.CELULAR?.includes(texto) ||
        cliente.EMAIL?.toLowerCase().includes(texto)
      );
    });
  }, [clientes, busqueda]);

  function abrirNuevoCliente() {
    setClienteEditando(null);
    setFormulario(formularioInicial);
    setError("");
    setMensaje("");
    setModalAbierto(true);
  }

  async function abrirHistorialCliente(cliente) {
    try {
      setClienteHistorial(cliente);
      setHistorial(null);
      setErrorHistorial("");
      setCargandoHistorial(true);
      setModalHistorial(true);

      const datos = await obtenerHistorialCliente(
        cliente.IDCLIENTE
      );

      setHistorial(datos);
    } catch (errorCarga) {
      setErrorHistorial(
        errorCarga.message ||
          "No se pudo cargar el historial"
      );
    } finally {
      setCargandoHistorial(false);
    }
  }

  function abrirEditarCliente(cliente) {
    setClienteEditando(cliente);

    setFormulario({
      dni: cliente.DNI || "",
      nombres: cliente.NOMBRES || "",
      apellidoPaterno: cliente.APELLIDO_PATERNO || "",
      apellidoMaterno: cliente.APELLIDO_MATERNO || "",
      celular: cliente.CELULAR || "",
      email: cliente.EMAIL || "",
      direccion: cliente.DIRECCION || "",
    });

    setError("");
    setMensaje("");
    setModalAbierto(true);
  }

  function manejarCambio(evento) {
    const { name } = evento.target;
    let { value } = evento.target;

    if (name === "dni") {
      value = value.replace(/\D/g, "").slice(0, 8);
    }

    if (name === "celular") {
      value = value.replace(/\D/g, "").slice(0, 9);
    }

    if (
      name === "nombres" ||
      name === "apellidoPaterno" ||
      name === "apellidoMaterno"
    ) {
      value = value
        .replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñüÜ\s-]/g, "")
        .slice(0, 100);
    }

    if (name === "email") {
      value = value.slice(0, 100);
    }

    if (name === "direccion") {
      value = value.slice(0, 200);
    }

    setFormulario((estadoAnterior) => ({
      ...estadoAnterior,
      [name]: value,
    }));
  }

  async function manejarGuardar(evento) {
    evento.preventDefault();

    try {
      setGuardando(true);
      setError("");
      setMensaje("");

      if (!/^\d{8}$/.test(formulario.dni)) {
        throw new Error(
          "El DNI debe contener exactamente 8 números"
        );
      }

      if (!/^\d{9}$/.test(formulario.celular)) {
        throw new Error(
          "El celular debe contener exactamente 9 números"
        );
      }

      const expresionNombre =
        /^[a-zA-ZÁÉÍÓÚáéíóúÑñüÜ\s-]{2,100}$/;

      if (!expresionNombre.test(formulario.nombres.trim())) {
        throw new Error(
          "Los nombres deben contener solo letras y tener mínimo 2 caracteres"
        );
      }

      if (
        !expresionNombre.test(
          formulario.apellidoPaterno.trim()
        )
      ) {
        throw new Error(
          "El apellido paterno debe contener solo letras"
        );
      }

      if (
        formulario.apellidoMaterno &&
        !expresionNombre.test(
          formulario.apellidoMaterno.trim()
        )
      ) {
        throw new Error(
          "El apellido materno debe contener solo letras"
        );
      }

      if (
        formulario.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          formulario.email
        )
      ) {
        throw new Error("El correo electrónico no es válido");
      }

      if (formulario.direccion.length > 200) {
        throw new Error(
          "La dirección no puede superar los 200 caracteres"
        );
      }

      if (clienteEditando) {
        await actualizarCliente(
          clienteEditando.IDCLIENTE,
          formulario
        );

        setMensaje("Cliente actualizado correctamente");
      } else {
        await crearCliente(formulario);
        setMensaje("Cliente registrado correctamente");
      }

      await cargarClientes();

      setTimeout(() => {
        setModalAbierto(false);
        setMensaje("");
      }, 700);
    } catch (errorGuardado) {
      setError(errorGuardado.message);
    } finally {
      setGuardando(false);
    }
  }

  async function manejarEliminar(cliente) {
    const confirmar = window.confirm(
      `¿Deseas eliminar a ${cliente.NOMBRES} ${cliente.APELLIDO_PATERNO}?`
    );

    if (!confirmar) return;

    try {
      setError("");
      await eliminarCliente(cliente.IDCLIENTE);
      await cargarClientes();
    } catch (errorEliminacion) {
      setError(errorEliminacion.message);
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
            Clientes
          </h1>

          <p className="mt-2 text-gray-600">
            Registra y administra los clientes de Taurus.
          </p>
        </div>

        <button
          onClick={abrirNuevoCliente}
          className="flex items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-3 font-semibold text-white transition hover:bg-red-800"
        >
          <Plus size={20} />
          Nuevo cliente
        </button>
      </div>

      {error &&
        !modalAbierto &&
        !modalHistorial && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
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
              placeholder="Buscar por DNI, nombre, celular o correo"
              className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 outline-none transition focus:border-red-600"
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users size={19} />
            {clientesFiltrados.length} clientes
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
            <table className="w-full min-w-[950px]">
              <thead>
                <tr className="border-b text-left text-sm text-gray-500">
                  <th className="pb-4">ID</th>
                  <th className="pb-4">DNI</th>
                  <th className="pb-4">Cliente</th>
                  <th className="pb-4">Celular</th>
                  <th className="pb-4">Correo</th>
                  <th className="pb-4">Dirección</th>
                  <th className="pb-4 text-right">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {clientesFiltrados.map((cliente) => (
                  <tr
                    key={cliente.IDCLIENTE}
                    className="border-b border-gray-100"
                  >
                    <td className="py-4 font-semibold">
                      {cliente.IDCLIENTE}
                    </td>

                    <td className="py-4">
                      {cliente.DNI}
                    </td>

                    <td className="py-4">
                      <p className="font-semibold text-gray-900">
                        {cliente.NOMBRES}{" "}
                        {cliente.APELLIDO_PATERNO}{" "}
                        {cliente.APELLIDO_MATERNO}
                      </p>
                    </td>

                    <td className="py-4">
                      {cliente.CELULAR}
                    </td>

                    <td className="py-4">
                      {cliente.EMAIL || "Sin correo"}
                    </td>

                    <td className="py-4">
                      {cliente.DIRECCION || "Sin dirección"}
                    </td>

                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            abrirHistorialCliente(cliente)
                          }
                          title="Ver historial completo"
                          className="rounded-lg bg-violet-50 p-2 text-violet-700 transition hover:bg-violet-100"
                        >
                          <History size={18} />
                        </button>

                        <button
                          onClick={() => abrirEditarCliente(cliente)}
                          title="Editar"
                          className="rounded-lg bg-blue-50 p-2 text-blue-700 transition hover:bg-blue-100"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          onClick={() => manejarEliminar(cliente)}
                          title="Eliminar"
                          className="rounded-lg bg-red-50 p-2 text-red-700 transition hover:bg-red-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {clientesFiltrados.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="py-16 text-center text-gray-500"
                    >
                      No se encontraron clientes.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalAbierto && (
        <ModalCliente
          formulario={formulario}
          clienteEditando={clienteEditando}
          guardando={guardando}
          mensaje={mensaje}
          error={error}
          manejarCambio={manejarCambio}
          manejarGuardar={manejarGuardar}
          cerrar={() => setModalAbierto(false)}
        />
      )}

      {modalHistorial && (
        <ModalHistorialCliente
          cliente={clienteHistorial}
          datos={historial}
          cargando={cargandoHistorial}
          error={errorHistorial}
          cerrar={() => {
            setModalHistorial(false);
            setClienteHistorial(null);
            setHistorial(null);
            setErrorHistorial("");
          }}
        />
      )}
    </section>
  );
}

function ModalHistorialCliente({
  cliente,
  datos,
  cargando,
  error,
  cerrar,
}) {
  const resumen = datos?.resumen || {};
  const equipos = datos?.equipos || [];
  const reparaciones =
    datos?.reparaciones || [];
  const pagos = datos?.pagos || [];
  const fotos = datos?.fotos || [];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/65 p-4">
      <div className="max-h-[94vh] w-full max-w-7xl overflow-y-auto rounded-3xl bg-gray-50 shadow-2xl">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b bg-white px-6 py-5 sm:px-8">
          <div>
            <div className="flex items-center gap-2">
              <History
                size={24}
                className="text-violet-700"
              />

              <h2 className="text-2xl font-black text-gray-950">
                Historial del cliente
              </h2>
            </div>

            <p className="mt-2 text-sm text-gray-500">
              {cliente?.NOMBRES}{" "}
              {cliente?.APELLIDO_PATERNO}{" "}
              {cliente?.APELLIDO_MATERNO || ""}
              {" · "}
              DNI {cliente?.DNI || "Sin DNI"}
            </p>
          </div>

          <button
            type="button"
            onClick={cerrar}
            className="rounded-xl p-2 text-gray-500 transition hover:bg-gray-100"
          >
            <X size={25} />
          </button>
        </header>

        {cargando ? (
          <div className="flex min-h-[420px] items-center justify-center">
            <LoaderCircle
              size={42}
              className="animate-spin text-violet-700"
            />
          </div>
        ) : error ? (
          <div className="p-8">
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
              <AlertCircle
                size={22}
                className="mt-0.5 shrink-0"
              />

              <p>{error}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-7 p-6 sm:p-8">
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <TarjetaHistorial
                titulo="Equipos"
                valor={resumen.EQUIPOS || 0}
                icono={Smartphone}
                clase="bg-blue-100 text-blue-700"
              />

              <TarjetaHistorial
                titulo="Reparaciones"
                valor={resumen.REPARACIONES || 0}
                icono={Wrench}
                clase="bg-amber-100 text-amber-700"
              />

              <TarjetaHistorial
                titulo="Reparaciones activas"
                valor={
                  resumen.REPARACIONES_ACTIVAS ||
                  0
                }
                icono={CalendarDays}
                clase="bg-orange-100 text-orange-700"
              />

              <TarjetaHistorial
                titulo="Total pagado"
                valor={formatearMoneda(
                  resumen.TOTAL_PAGADO
                )}
                icono={CircleDollarSign}
                clase="bg-emerald-100 text-emerald-700"
              />

              <TarjetaHistorial
                titulo="Saldo pendiente"
                valor={formatearMoneda(
                  resumen.SALDO_PENDIENTE
                )}
                icono={Wallet}
                clase="bg-red-100 text-red-700"
              />
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex items-center gap-2">
                <Smartphone
                  size={21}
                  className="text-blue-700"
                />

                <h3 className="text-xl font-black text-gray-950">
                  Equipos registrados
                </h3>
              </div>

              {equipos.length === 0 ? (
                <Vacio texto="El cliente no tiene equipos registrados." />
              ) : (
                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {equipos.map((equipo) => (
                    <article
                      key={equipo.IDEQUIPO}
                      className="rounded-2xl border border-gray-200 p-5"
                    >
                      <p className="text-lg font-black text-gray-950">
                        {equipo.MARCA}{" "}
                        {equipo.MODELO}
                      </p>

                      <div className="mt-4 space-y-2 text-sm text-gray-600">
                        <p>
                          <strong>Tipo:</strong>{" "}
                          {equipo.TIPO_DISPOSITIVO ||
                            "Sin registrar"}
                        </p>

                        <p>
                          <strong>IMEI:</strong>{" "}
                          {equipo.IMEI ||
                            "Sin registrar"}
                        </p>

                        <p>
                          <strong>Serie:</strong>{" "}
                          {equipo.NUMERO_SERIE ||
                            "Sin registrar"}
                        </p>

                        <p>
                          <strong>Color:</strong>{" "}
                          {equipo.COLOR ||
                            "Sin registrar"}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex items-center gap-2">
                <Wrench
                  size={21}
                  className="text-amber-700"
                />

                <h3 className="text-xl font-black text-gray-950">
                  Reparaciones
                </h3>
              </div>

              {reparaciones.length === 0 ? (
                <Vacio texto="El cliente no tiene reparaciones registradas." />
              ) : (
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[1000px]">
                    <thead>
                      <tr className="border-b text-left text-sm text-gray-500">
                        <th className="pb-3">
                          Código
                        </th>
                        <th className="pb-3">
                          Equipo
                        </th>
                        <th className="pb-3">
                          Estado
                        </th>
                        <th className="pb-3">
                          Ingreso
                        </th>
                        <th className="pb-3">
                          Total
                        </th>
                        <th className="pb-3">
                          Pagado
                        </th>
                        <th className="pb-3">
                          Saldo
                        </th>
                        <th className="pb-3">
                          Fotos
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {reparaciones.map(
                        (reparacion) => (
                          <tr
                            key={
                              reparacion.IDREPARACION
                            }
                            className="border-b border-gray-100"
                          >
                            <td className="py-4 font-bold text-gray-950">
                              {reparacion.CODIGO}
                            </td>

                            <td className="py-4">
                              {reparacion.MARCA}{" "}
                              {reparacion.MODELO}
                            </td>

                            <td className="py-4">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-bold ${obtenerClaseEstado(
                                  reparacion.ESTADO_REPARACION
                                )}`}
                              >
                                {
                                  reparacion.ESTADO_REPARACION
                                }
                              </span>
                            </td>

                            <td className="py-4 text-gray-600">
                              {formatearFechaHora(
                                reparacion.FECHA_INGRESO
                              )}
                            </td>

                            <td className="py-4 font-semibold">
                              {formatearMoneda(
                                reparacion.TOTAL_REPARACION
                              )}
                            </td>

                            <td className="py-4 font-semibold text-emerald-700">
                              {formatearMoneda(
                                reparacion.TOTAL_PAGADO
                              )}
                            </td>

                            <td className="py-4 font-semibold text-red-700">
                              {formatearMoneda(
                                reparacion.SALDO_PENDIENTE
                              )}
                            </td>

                            <td className="py-4">
                              {reparacion.FOTOS || 0}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex items-center gap-2">
                <Wallet
                  size={21}
                  className="text-emerald-700"
                />

                <h3 className="text-xl font-black text-gray-950">
                  Historial de pagos
                </h3>
              </div>

              {pagos.length === 0 ? (
                <Vacio texto="El cliente no tiene pagos registrados." />
              ) : (
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[760px]">
                    <thead>
                      <tr className="border-b text-left text-sm text-gray-500">
                        <th className="pb-3">
                          Reparación
                        </th>
                        <th className="pb-3">
                          Monto
                        </th>
                        <th className="pb-3">
                          Método
                        </th>
                        <th className="pb-3">
                          Fecha
                        </th>
                        <th className="pb-3">
                          Observación
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {pagos.map((pago) => (
                        <tr
                          key={pago.IDPAGO}
                          className="border-b border-gray-100"
                        >
                          <td className="py-4 font-bold">
                            {pago.CODIGO}
                          </td>

                          <td className="py-4 font-black text-emerald-700">
                            {formatearMoneda(
                              pago.MONTO
                            )}
                          </td>

                          <td className="py-4">
                            {pago.METODO_PAGO}
                          </td>

                          <td className="py-4 text-gray-600">
                            {formatearFechaHora(
                              pago.FECHA_PAGO
                            )}
                          </td>

                          <td className="py-4">
                            {pago.OBSERVACIONES ||
                              "Sin observación"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex items-center gap-2">
                <Images
                  size={21}
                  className="text-violet-700"
                />

                <h3 className="text-xl font-black text-gray-950">
                  Fotos de reparaciones
                </h3>
              </div>

              {fotos.length === 0 ? (
                <Vacio texto="El cliente no tiene fotos de reparaciones." />
              ) : (
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {fotos.map((foto) => (
                    <article
                      key={foto.IDFOTO}
                      className="overflow-hidden rounded-2xl border border-gray-200"
                    >
                      <a
                        href={foto.URL}
                        target="_blank"
                        rel="noreferrer"
                        className="group relative block aspect-square bg-gray-100"
                      >
                        <img
                          src={foto.URL}
                          alt={
                            foto.DESCRIPCION ||
                            foto.TIPO
                          }
                          className="h-full w-full object-cover"
                        />

                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/40">
                          <ExternalLink
                            size={26}
                            className="text-white opacity-0 transition group-hover:opacity-100"
                          />
                        </div>
                      </a>

                      <div className="p-4">
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
                            {foto.TIPO}
                          </span>

                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                            {foto.CODIGO}
                          </span>
                        </div>

                        <p className="mt-3 text-sm text-gray-600">
                          {foto.DESCRIPCION ||
                            "Sin descripción"}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function TarjetaHistorial({
  titulo,
  valor,
  icono: Icono,
  clase,
}) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5">
      <div
        className={`inline-flex rounded-xl p-3 ${clase}`}
      >
        <Icono size={22} />
      </div>

      <p className="mt-4 text-sm font-semibold text-gray-500">
        {titulo}
      </p>

      <p className="mt-1 text-2xl font-black text-gray-950">
        {valor}
      </p>
    </article>
  );
}

function Vacio({ texto }) {
  return (
    <div className="mt-5 rounded-xl bg-gray-50 py-10 text-center text-gray-500">
      {texto}
    </div>
  );
}

function ModalCliente({
  formulario,
  clienteEditando,
  guardando,
  mensaje,
  error,
  manejarCambio,
  manejarGuardar,
  cerrar,
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-7 py-5">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {clienteEditando
                ? "Editar cliente"
                : "Registrar cliente"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Completa la información solicitada.
            </p>
          </div>

          <button
            onClick={cerrar}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        <form
          onSubmit={manejarGuardar}
          className="grid gap-5 p-7 md:grid-cols-2"
        >
          <Campo
            label="DNI"
            name="dni"
            value={formulario.dni}
            onChange={manejarCambio}
            maxLength={8}
            inputMode="numeric"
            placeholder="8 dígitos"
            required
          />

          <Campo
            label="Nombres"
            name="nombres"
            value={formulario.nombres}
            onChange={manejarCambio}
            maxLength={20}
            placeholder="Ejemplo: Patricio Roberto"
            required
          />

          <Campo
            label="Apellido paterno"
            name="apellidoPaterno"
            value={formulario.apellidoPaterno}
            onChange={manejarCambio}
            maxLength={20}
            required
          />

          <Campo
            label="Apellido materno"
            name="apellidoMaterno"
            value={formulario.apellidoMaterno}
            onChange={manejarCambio}
            maxLength={20}
          />

          <Campo
            label="Celular"
            name="celular"
            value={formulario.celular}
            onChange={manejarCambio}
            maxLength={9}
            inputMode="numeric"
            placeholder="9 dígitos"
            required
          />

          <Campo
            label="Correo"
            name="email"
            type="email"
            value={formulario.email}
            onChange={manejarCambio}
            maxLength={100}
            placeholder="ejemplo@correo.com"
          />

          <Campo
            label="Dirección"
            name="direccion"
            value={formulario.direccion}
            onChange={manejarCambio}
            maxLength={200}
            placeholder="Máximo 200 caracteres"
          />

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 md:col-span-2">
              {error}
            </div>
          )}

          {mensaje && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-700 md:col-span-2">
              {mensaje}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t pt-5 md:col-span-2">
            <button
              type="button"
              onClick={cerrar}
              className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={guardando}
              className="flex items-center gap-2 rounded-xl bg-red-700 px-6 py-3 font-semibold text-white transition hover:bg-red-800 disabled:opacity-60"
            >
              {guardando && (
                <LoaderCircle
                  size={19}
                  className="animate-spin"
                />
              )}

              {guardando
                ? "Guardando..."
                : clienteEditando
                  ? "Guardar cambios"
                  : "Registrar cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Campo({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  maxLength,
  inputMode,
  placeholder,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
        {required && (
          <span className="text-red-600"> *</span>
        )}
      </span>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        maxLength={maxLength}
        inputMode={inputMode}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-red-600"
      />

      {maxLength && (
        <p className="mt-1 text-right text-xs text-gray-500">
          {value.length}/{maxLength}
        </p>
      )}
    </label>
  );
}

function formatearMoneda(valor) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(Number(valor || 0));
}

function formatearFechaHora(fecha) {
  if (!fecha) return "Sin fecha";

  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(valor);
}

function obtenerClaseEstado(estado) {
  const nombre = String(estado || "")
    .trim()
    .toUpperCase();

  if (
    nombre.includes("ENTREGADO") ||
    nombre.includes("FINALIZADO")
  ) {
    return "bg-emerald-100 text-emerald-700";
  }

  if (
    nombre.includes("NO REPARABLE") ||
    nombre.includes("CANCELADO")
  ) {
    return "bg-red-100 text-red-700";
  }

  if (
    nombre.includes("LISTO") ||
    nombre.includes("REPARADO")
  ) {
    return "bg-blue-100 text-blue-700";
  }

  return "bg-amber-100 text-amber-700";
}

export default Clients;