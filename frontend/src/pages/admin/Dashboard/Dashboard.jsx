import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  LoaderCircle,
  Package,
  RefreshCw,
  Smartphone,
  TriangleAlert,
  Users,
  Wrench,
} from "lucide-react";

import {
  obtenerDashboard,
} from "../../../services/dashboardService";

function formatearFecha(fecha) {
  if (!fecha) {
    return "Sin fecha";
  }

  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(valor);
}

function formatearFechaHora(fecha) {
  if (!fecha) {
    return "Sin fecha";
  }

  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(valor);
}

function formatearMoneda(valor) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(Number(valor || 0));
}

function obtenerClaseEstado(estado) {
  const nombre = String(estado || "")
    .trim()
    .toUpperCase();

  if (
    nombre.includes("LISTO") ||
    nombre.includes("REPARADO")
  ) {
    return "bg-blue-100 text-blue-700";
  }

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

  return "bg-amber-100 text-amber-700";
}

function TarjetaResumen({
  titulo,
  valor,
  descripcion,
  icono: Icono,
  ruta,
  claseIcono,
}) {
  return (
    <Link
      to={ruta}
      className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-red-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-500">
            {titulo}
          </p>

          <h2 className="mt-2 text-3xl font-black text-gray-950">
            {valor}
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {descripcion}
          </p>
        </div>

        <div
          className={`rounded-2xl p-3 ${claseIcono}`}
        >
          <Icono size={25} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1 text-sm font-bold text-red-700">
        Ver módulo
        <ArrowUpRight
          size={16}
          className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </div>
    </Link>
  );
}

function Dashboard() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] =
    useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarDashboard(true);
  }, []);

  async function cargarDashboard(esCargaInicial = false) {
    try {
      if (esCargaInicial) {
        setCargando(true);
      } else {
        setActualizando(true);
      }

      setError("");

      const resultado = await obtenerDashboard();
      setDatos(resultado);
    } catch (errorCarga) {
      setError(
        errorCarga.message ||
          "No se pudo cargar el dashboard"
      );
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  }

  if (cargando) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <LoaderCircle
          className="animate-spin text-red-700"
          size={42}
        />
      </div>
    );
  }

  if (error && !datos) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        <div className="flex items-start gap-3">
          <AlertCircle
            size={24}
            className="mt-0.5 shrink-0"
          />

          <div>
            <p className="font-bold">
              No se pudo cargar el dashboard
            </p>

            <p className="mt-1">{error}</p>

            <button
              type="button"
              onClick={() => cargarDashboard(true)}
              className="mt-4 rounded-xl bg-red-700 px-4 py-2 font-bold text-white transition hover:bg-red-800"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const {
    resumen = {},
    reparacionesRecientes = [],
    reparacionesAtrasadas = [],
    productosStockBajo = [],
    pagosRecientes = [],
  } = datos || {};

  const tarjetas = [
    {
      titulo: "Clientes",
      valor: resumen.CLIENTES || 0,
      descripcion: "Clientes activos registrados",
      icono: Users,
      ruta: "/admin/clientes",
      claseIcono: "bg-red-100 text-red-700",
    },
    {
      titulo: "Equipos",
      valor: resumen.EQUIPOS || 0,
      descripcion: "Equipos registrados",
      icono: Smartphone,
      ruta: "/admin/equipos",
      claseIcono: "bg-blue-100 text-blue-700",
    },
    {
      titulo: "Reparaciones activas",
      valor: resumen.REPARACIONES_ACTIVAS || 0,
      descripcion: "Trabajos todavía abiertos",
      icono: Wrench,
      ruta: "/admin/reparaciones",
      claseIcono: "bg-amber-100 text-amber-700",
    },
    {
      titulo: "Listos para recoger",
      valor: resumen.LISTOS_PARA_RECOGER || 0,
      descripcion: "Equipos esperando entrega",
      icono: CheckCircle2,
      ruta: "/admin/reparaciones",
      claseIcono: "bg-emerald-100 text-emerald-700",
    },
    {
      titulo: "Reparaciones atrasadas",
      valor: resumen.REPARACIONES_ATRASADAS || 0,
      descripcion: "Superaron la fecha estimada",
      icono: CalendarClock,
      ruta: "/admin/reparaciones",
      claseIcono: "bg-orange-100 text-orange-700",
    },
    {
      titulo: "Stock bajo",
      valor: resumen.STOCK_BAJO || 0,
      descripcion: `${resumen.SIN_STOCK || 0} sin stock`,
      icono: Package,
      ruta: "/admin/inventario",
      claseIcono: "bg-violet-100 text-violet-700",
    },
    {
      titulo: "Ingresos de hoy",
      valor: formatearMoneda(
        resumen.INGRESOS_DIA
      ),
      descripcion: "Pagos de reparaciones",
      icono: CircleDollarSign,
      ruta: "/admin/reparaciones",
      claseIcono: "bg-emerald-100 text-emerald-700",
    },
    {
      titulo: "Ingresos del mes",
      valor: formatearMoneda(
        resumen.INGRESOS_MES
      ),
      descripcion: "Pagos acumulados del mes",
      icono: CircleDollarSign,
      ruta: "/admin/reportes",
      claseIcono: "bg-sky-100 text-sky-700",
    },
  ];

  return (
    <section>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-red-700">
            Panel administrativo
          </p>

          <h1 className="mt-1 text-3xl font-black text-gray-950">
            Dashboard
          </h1>

          <p className="mt-2 text-gray-600">
            Resumen general y alertas importantes de
            Taurus.
          </p>
        </div>

        <button
          type="button"
          onClick={() => cargarDashboard(false)}
          disabled={actualizando}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={18}
            className={
              actualizando ? "animate-spin" : ""
            }
          />

          {actualizando
            ? "Actualizando"
            : "Actualizar"}
        </button>
      </div>

      {error && datos && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <AlertCircle
            size={20}
            className="mt-0.5 shrink-0"
          />

          <p>{error}</p>
        </div>
      )}

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {tarjetas.map((tarjeta) => (
          <TarjetaResumen
            key={tarjeta.titulo}
            {...tarjeta}
          />
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-red-700">
                Atención prioritaria
              </p>

              <h2 className="mt-1 text-xl font-black text-gray-950">
                Reparaciones atrasadas
              </h2>
            </div>

            <TriangleAlert className="text-orange-600" />
          </div>

          <div className="mt-5 space-y-3">
            {reparacionesAtrasadas.map(
              (reparacion) => (
                <Link
                  key={reparacion.IDREPARACION}
                  to="/admin/reparaciones"
                  className="block rounded-xl border border-gray-200 p-4 transition hover:border-orange-200 hover:bg-orange-50/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-950">
                        {reparacion.CODIGO}
                      </p>

                      <p className="mt-1 truncate text-sm text-gray-600">
                        {reparacion.CLIENTE}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {reparacion.MARCA}{" "}
                        {reparacion.MODELO}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                        {reparacion.DIAS_ATRASO} días
                      </span>

                      <p className="mt-2 text-xs text-gray-500">
                        {formatearFecha(
                          reparacion.FECHA_ESTIMADA
                        )}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            )}

            {reparacionesAtrasadas.length === 0 && (
              <div className="rounded-xl bg-emerald-50 p-5 text-center text-emerald-700">
                <CheckCircle2
                  size={28}
                  className="mx-auto"
                />

                <p className="mt-2 font-bold">
                  No hay reparaciones atrasadas
                </p>
              </div>
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-red-700">
                Inventario
              </p>

              <h2 className="mt-1 text-xl font-black text-gray-950">
                Productos con poco stock
              </h2>
            </div>

            <Package className="text-violet-600" />
          </div>

          <div className="mt-5 space-y-3">
            {productosStockBajo.map((producto) => (
              <Link
                key={producto.IDPRODUCTO}
                to="/admin/inventario"
                className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 p-4 transition hover:border-violet-200 hover:bg-violet-50/50"
              >
                <div className="min-w-0">
                  <p className="truncate font-bold text-gray-950">
                    {producto.NOMBRE}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {producto.CODIGO}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-sm font-black ${
                    Number(producto.STOCK) <= 0
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {producto.STOCK} unidades
                </span>
              </Link>
            ))}

            {productosStockBajo.length === 0 && (
              <div className="rounded-xl bg-emerald-50 p-5 text-center text-emerald-700">
                <CheckCircle2
                  size={28}
                  className="mx-auto"
                />

                <p className="mt-2 font-bold">
                  El inventario tiene stock suficiente
                </p>
              </div>
            )}
          </div>
        </article>
      </div>

      <article className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-red-700">
              Actividad reciente
            </p>

            <h2 className="mt-1 text-xl font-black text-gray-950">
              Reparaciones recientes
            </h2>
          </div>

          <Link
            to="/admin/reparaciones"
            className="inline-flex items-center gap-1 text-sm font-bold text-red-700 hover:text-red-800"
          >
            Ver reparaciones
            <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b text-left text-sm text-gray-500">
                <th className="pb-4">Código</th>
                <th className="pb-4">Cliente</th>
                <th className="pb-4">Equipo</th>
                <th className="pb-4">Estado</th>
                <th className="pb-4">Fecha</th>
              </tr>
            </thead>

            <tbody>
              {reparacionesRecientes.map(
                (reparacion) => (
                  <tr
                    key={reparacion.IDREPARACION}
                    className="border-b border-gray-100"
                  >
                    <td className="py-4 font-bold text-gray-950">
                      {reparacion.CODIGO}
                    </td>

                    <td className="py-4">
                      {reparacion.CLIENTE}
                    </td>

                    <td className="py-4">
                      {reparacion.MARCA}{" "}
                      {reparacion.MODELO}
                    </td>

                    <td className="py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-bold ${obtenerClaseEstado(
                          reparacion.ESTADO
                        )}`}
                      >
                        {reparacion.ESTADO}
                      </span>
                    </td>

                    <td className="py-4 text-gray-600">
                      {formatearFecha(
                        reparacion.FECHA_INGRESO
                      )}
                    </td>
                  </tr>
                )
              )}

              {reparacionesRecientes.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="py-10 text-center text-gray-500"
                  >
                    No hay reparaciones registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>

      <article className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-red-700">
              Caja
            </p>

            <h2 className="mt-1 text-xl font-black text-gray-950">
              Pagos recientes de reparaciones
            </h2>
          </div>

          <Clock3 className="text-gray-500" />
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b text-left text-sm text-gray-500">
                <th className="pb-4">Reparación</th>
                <th className="pb-4">Método</th>
                <th className="pb-4">Monto</th>
                <th className="pb-4">Fecha</th>
              </tr>
            </thead>

            <tbody>
              {pagosRecientes.map((pago) => (
                <tr
                  key={pago.IDPAGO}
                  className="border-b border-gray-100"
                >
                  <td className="py-4 font-bold text-gray-950">
                    {pago.CODIGO}
                  </td>

                  <td className="py-4">
                    {pago.METODO_PAGO}
                  </td>

                  <td className="py-4 font-black text-emerald-700">
                    {formatearMoneda(pago.MONTO)}
                  </td>

                  <td className="py-4 text-gray-600">
                    {formatearFechaHora(
                      pago.FECHA_PAGO
                    )}
                  </td>
                </tr>
              ))}

              {pagosRecientes.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="py-10 text-center text-gray-500"
                  >
                    No hay pagos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}

export default Dashboard;
