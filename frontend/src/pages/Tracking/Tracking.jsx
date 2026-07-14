import { useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  Clock3,
  LoaderCircle,
  Package,
  RotateCcw,
  Search,
  ShieldCheck,
  Smartphone,
  Wrench,
} from "lucide-react";

import {
  buscarReparacionesPorDni,
} from "../../services/reparacionService";

function formatearFecha(fecha) {
  if (!fecha) {
    return "Sin registrar";
  }

  const fechaFormateada = new Date(fecha);

  if (Number.isNaN(fechaFormateada.getTime())) {
    return "Sin registrar";
  }

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(fechaFormateada);
}

function formatearMoneda(valor) {
  const numero = Number(valor || 0);

  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(numero);
}

function obtenerClasesEstado(estado) {
  const nombre = String(estado || "")
    .trim()
    .toUpperCase();

  if (
    nombre.includes("ENTREGADO") ||
    nombre.includes("FINALIZADO")
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (
    nombre.includes("NO REPARABLE") ||
    nombre.includes("CANCELADO")
  ) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (
    nombre.includes("LISTO") ||
    nombre.includes("REPARADO")
  ) {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

function Dato({
  icono: Icono,
  titulo,
  valor,
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-gray-100 p-2 text-gray-700">
          <Icono size={19} />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {titulo}
          </p>

          <p className="mt-1 break-words font-semibold text-gray-900">
            {valor}
          </p>
        </div>
      </div>
    </div>
  );
}

function ReparacionCard({
  item,
  indice,
  abierto,
  alAlternar,
}) {
  const {
    reparacion,
    historial = [],
    repuestos = [],
  } = item;

  const total = Number(
    reparacion.TOTAL_REPARACION || 0
  );

  const pagado = Number(
    reparacion.TOTAL_PAGADO || 0
  );

  const saldo = Number(
    reparacion.SALDO_PENDIENTE || 0
  );

  return (
    <article className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={alAlternar}
        className="flex w-full items-start justify-between gap-4 p-5 text-left transition hover:bg-gray-50 sm:p-6"
      >
        <div className="flex min-w-0 gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-700 text-white">
            <Smartphone size={23} />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-red-700">
              Reparación {indice + 1}
            </p>

            <h2 className="mt-1 truncate text-xl font-bold text-gray-950">
              {reparacion.MARCA}{" "}
              {reparacion.MODELO}
            </h2>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-3 py-1 text-xs font-bold ${obtenerClasesEstado(
                  reparacion.ESTADO_REPARACION
                )}`}
              >
                {reparacion.ESTADO_REPARACION}
              </span>

              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                {reparacion.CODIGO}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-1 shrink-0 rounded-xl border border-gray-200 p-2 text-gray-600">
          {abierto ? (
            <ChevronUp size={20} />
          ) : (
            <ChevronDown size={20} />
          )}
        </div>
      </button>

      {abierto && (
        <div className="border-t border-gray-200 bg-gray-50/70 p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Dato
              icono={CalendarDays}
              titulo="Fecha de ingreso"
              valor={formatearFecha(
                reparacion.FECHA_INGRESO
              )}
            />

            <Dato
              icono={Clock3}
              titulo="Fecha estimada"
              valor={formatearFecha(
                reparacion.FECHA_ESTIMADA
              )}
            />

            <Dato
              icono={CheckCircle2}
              titulo="Fecha de entrega"
              valor={formatearFecha(
                reparacion.FECHA_ENTREGA
              )}
            />

            <Dato
              icono={ShieldCheck}
              titulo="Garantía"
              valor={
                Number(reparacion.GARANTIA_DIAS || 0) >
                0
                  ? `${reparacion.GARANTIA_DIAS} días`
                  : "Sin registrar"
              }
            />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <p className="text-sm font-semibold text-gray-500">
                Total de reparación
              </p>

              <p className="mt-2 text-2xl font-black text-gray-950">
                {formatearMoneda(total)}
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="text-sm font-semibold text-emerald-700">
                Total pagado
              </p>

              <p className="mt-2 text-2xl font-black text-emerald-800">
                {formatearMoneda(pagado)}
              </p>
            </div>

            <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <p className="text-sm font-semibold text-red-700">
                Saldo pendiente
              </p>

              <p className="mt-2 text-2xl font-black text-red-800">
                {formatearMoneda(saldo)}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <Wrench
                  size={20}
                  className="text-red-700"
                />

                <h3 className="font-bold text-gray-950">
                  Información técnica
                </h3>
              </div>

              <div className="mt-5 space-y-5">
                <div>
                  <p className="text-sm font-semibold text-gray-500">
                    Falla reportada
                  </p>

                  <p className="mt-1 whitespace-pre-line text-gray-800">
                    {reparacion.FALLA_REPORTADA ||
                      "Sin registrar"}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-500">
                    Diagnóstico
                  </p>

                  <p className="mt-1 whitespace-pre-line text-gray-800">
                    {reparacion.DIAGNOSTICO ||
                      "Todavía no se ha registrado"}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-500">
                    Solución realizada
                  </p>

                  <p className="mt-1 whitespace-pre-line text-gray-800">
                    {reparacion.SOLUCION ||
                      "Todavía no se ha registrado"}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <Clock3
                  size={20}
                  className="text-red-700"
                />

                <h3 className="font-bold text-gray-950">
                  Historial del servicio
                </h3>
              </div>

              {historial.length === 0 ? (
                <p className="mt-5 text-sm text-gray-500">
                  No hay movimientos registrados.
                </p>
              ) : (
                <div className="mt-5 space-y-4">
                  {historial.map(
                    (movimiento, movimientoIndice) => (
                      <div
                        key={`${movimiento.ESTADO}-${movimiento.FECHA}-${movimientoIndice}`}
                        className="flex gap-3"
                      >
                        <div className="mt-1 flex flex-col items-center">
                          <div className="h-3 w-3 rounded-full bg-red-700" />

                          {movimientoIndice <
                            historial.length - 1 && (
                            <div className="mt-1 h-full min-h-10 w-px bg-gray-300" />
                          )}
                        </div>

                        <div className="pb-3">
                          <p className="font-semibold text-gray-900">
                            {movimiento.ESTADO}
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            {formatearFecha(
                              movimiento.FECHA
                            )}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </section>
          </div>

          <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <Package
                size={20}
                className="text-red-700"
              />

              <h3 className="font-bold text-gray-950">
                Repuestos utilizados
              </h3>
            </div>

            {repuestos.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500">
                No hay repuestos registrados.
              </p>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {repuestos.map(
                  (repuesto, repuestoIndice) => (
                    <div
                      key={`${repuesto.PRODUCTO}-${repuestoIndice}`}
                      className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 px-4 py-3"
                    >
                      <span className="font-medium text-gray-800">
                        {repuesto.PRODUCTO}
                      </span>

                      <span className="rounded-lg bg-gray-100 px-3 py-1 text-sm font-bold text-gray-700">
                        x{repuesto.CANTIDAD}
                      </span>
                    </div>
                  )
                )}
              </div>
            )}
          </section>
        </div>
      )}
    </article>
  );
}

function Tracking() {
  const [dni, setDni] = useState("");
  const [reparaciones, setReparaciones] =
    useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [busquedaRealizada, setBusquedaRealizada] =
    useState(false);
  const [reparacionAbierta, setReparacionAbierta] =
    useState(0);

  function manejarCambioDni(evento) {
    const valor = evento.target.value
      .replace(/\D/g, "")
      .slice(0, 8);

    setDni(valor);
    setError("");
  }

  async function manejarConsulta(evento) {
    evento.preventDefault();

    if (!/^\d{8}$/.test(dni)) {
      setError("Ingresa un DNI válido de 8 números.");
      return;
    }

    try {
      setCargando(true);
      setError("");
      setBusquedaRealizada(false);

      const resultado =
        await buscarReparacionesPorDni(dni);

      setReparaciones(
        resultado.reparaciones || []
      );
      setBusquedaRealizada(true);
      setReparacionAbierta(0);
    } catch (errorConsulta) {
      setReparaciones([]);
      setBusquedaRealizada(true);
      setError(
        errorConsulta.message ||
          "No se pudo realizar la consulta."
      );
    } finally {
      setCargando(false);
    }
  }

  function limpiarConsulta() {
    setDni("");
    setReparaciones([]);
    setError("");
    setBusquedaRealizada(false);
    setReparacionAbierta(0);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="border-b border-gray-200 bg-black text-white">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-gray-200">
              <ShieldCheck size={17} />
              Consulta pública
            </span>

            <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">
              Revisa el estado de tu reparación
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-gray-300">
              Ingresa tu DNI para consultar el avance,
              diagnóstico, fechas y pagos de los equipos
              registrados a tu nombre.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <form onSubmit={manejarConsulta}>
            <label
              htmlFor="dni-seguimiento"
              className="text-sm font-bold text-gray-900"
            >
              Número de DNI
            </label>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  size={20}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="dni-seguimiento"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={dni}
                  onChange={manejarCambioDni}
                  placeholder="Ejemplo: 12345678"
                  maxLength={8}
                  className="h-14 w-full rounded-2xl border border-gray-300 bg-white pl-12 pr-4 text-lg font-semibold text-gray-950 outline-none transition placeholder:font-normal placeholder:text-gray-400 focus:border-red-700 focus:ring-4 focus:ring-red-100"
                />
              </div>

              <button
                type="submit"
                disabled={cargando}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-red-700 px-7 font-bold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cargando ? (
                  <>
                    <LoaderCircle
                      size={20}
                      className="animate-spin"
                    />
                    Consultando
                  </>
                ) : (
                  <>
                    <Search size={20} />
                    Consultar
                  </>
                )}
              </button>
            </div>

            <div className="mt-4 flex items-start gap-2 text-sm text-gray-500">
              <ShieldCheck
                size={17}
                className="mt-0.5 shrink-0 text-emerald-600"
              />

              <p>
                Solo se muestran datos relacionados con el
                servicio técnico. No se muestran tus datos
                personales.
              </p>
            </div>
          </form>

          {error && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0"
              />

              <p className="font-medium">{error}</p>
            </div>
          )}
        </div>

        {busquedaRealizada &&
          reparaciones.length > 0 && (
            <div className="mx-auto mt-10 max-w-5xl">
              <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm font-semibold text-red-700">
                    Resultado de la consulta
                  </p>

                  <h2 className="mt-1 text-2xl font-black text-gray-950">
                    {reparaciones.length === 1
                      ? "1 reparación encontrada"
                      : `${reparaciones.length} reparaciones encontradas`}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={limpiarConsulta}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-100"
                >
                  <RotateCcw size={17} />
                  Nueva consulta
                </button>
              </div>

              <div className="space-y-5">
                {reparaciones.map(
                  (item, indice) => (
                    <ReparacionCard
                      key={
                        item.reparacion.CODIGO ||
                        indice
                      }
                      item={item}
                      indice={indice}
                      abierto={
                        reparacionAbierta === indice
                      }
                      alAlternar={() =>
                        setReparacionAbierta(
                          reparacionAbierta === indice
                            ? -1
                            : indice
                        )
                      }
                    />
                  )
                )}
              </div>
            </div>
          )}

        {!busquedaRealizada && (
          <div className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <Wrench
                size={24}
                className="text-red-700"
              />

              <h3 className="mt-4 font-bold text-gray-950">
                Estado actualizado
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Revisa si tu equipo está en diagnóstico,
                reparación o listo para recoger.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <CircleDollarSign
                size={24}
                className="text-red-700"
              />

              <h3 className="mt-4 font-bold text-gray-950">
                Pagos y saldo
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Consulta el costo registrado, lo pagado y
                cualquier saldo pendiente.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <Package
                size={24}
                className="text-red-700"
              />

              <h3 className="mt-4 font-bold text-gray-950">
                Historial y repuestos
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Visualiza los avances del servicio y los
                repuestos utilizados.
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default Tracking;
