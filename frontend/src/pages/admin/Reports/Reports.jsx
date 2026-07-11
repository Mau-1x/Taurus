import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  ShoppingCart,
  Wallet,
  Wrench,
  CalendarDays,
  Package,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { obtenerReporteGeneral } from "../../../services/reporteService";

const nombresMeses = [
  "",
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

function Reports() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarReporte();
  }, []);

  async function cargarReporte() {
    try {
      setCargando(true);
      setError("");

      const resultado = await obtenerReporteGeneral();
      setDatos(resultado);
    } catch (errorCarga) {
      setError(errorCarga.message);
    } finally {
      setCargando(false);
    }
  }

  const ventasMensuales = useMemo(() => {
    if (!datos?.ventasPorMes) return [];

    return datos.ventasPorMes.map((item) => ({
      periodo: `${nombresMeses[item.MES]} ${item.ANIO}`,
      ventas: Number(item.TOTAL_VENDIDO || 0),
      cantidad: Number(item.CANTIDAD_VENTAS || 0),
    }));
  }, [datos]);

  if (cargando) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <LoaderCircle
          size={42}
          className="animate-spin text-red-700"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        <div className="flex items-center gap-3">
          <AlertCircle size={24} />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const {
    resumen,
    ventasRecientes,
    reparacionesRecientes,
    stockBajo,
  } = datos;

  const tarjetas = [
    {
      titulo: "Ventas completadas",
      valor: resumen.TOTAL_VENTAS,
      icono: ShoppingCart,
    },
    {
      titulo: "Ingresos por ventas",
      valor: `S/ ${Number(
        resumen.INGRESOS_VENTAS || 0
      ).toFixed(2)}`,
      icono: Wallet,
    },
    {
      titulo: "Reparaciones activas",
      valor: resumen.REPARACIONES_ACTIVAS,
      icono: Wrench,
    },
    {
      titulo: "Reparaciones entregadas",
      valor: resumen.REPARACIONES_ENTREGADAS,
      icono: BarChart3,
    },
    {
      titulo: "Reservas pendientes",
      valor: resumen.RESERVAS_PENDIENTES,
      icono: CalendarDays,
    },
    {
      titulo: "Productos con stock bajo",
      valor: resumen.PRODUCTOS_STOCK_BAJO,
      icono: Package,
    },
  ];

  return (
    <section>
      <div>
        <p className="text-sm text-gray-500">
          Gestión administrativa
        </p>

        <h1 className="mt-1 text-3xl font-bold text-gray-900">
          Reportes
        </h1>

        <p className="mt-2 text-gray-600">
          Consulta el rendimiento general del negocio.
        </p>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {tarjetas.map((tarjeta) => {
          const Icono = tarjeta.icono;

          return (
            <article
              key={tarjeta.titulo}
              className="rounded-2xl bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    {tarjeta.titulo}
                  </p>

                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {tarjeta.valor}
                  </p>
                </div>

                <div className="rounded-2xl bg-red-100 p-4 text-red-700">
                  <Icono size={27} />
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Ventas de los últimos meses
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Total vendido por mes.
          </p>
        </div>

        <div className="mt-6 h-[320px]">
          {ventasMensuales.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ventasMensuales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periodo" />
                <YAxis />
                <Tooltip
                  formatter={(valor) => [
                    `S/ ${Number(valor).toFixed(2)}`,
                    "Ventas",
                  ]}
                />
                <Bar
                  dataKey="ventas"
                  fill="#b91c1c"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">
              No hay datos de ventas mensuales.
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-2">
        <TablaVentas ventas={ventasRecientes} />
        <TablaReparaciones reparaciones={reparacionesRecientes} />
      </div>

      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">
          Productos con stock bajo
        </h2>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b text-left text-sm text-gray-500">
                <th className="pb-4">Código</th>
                <th className="pb-4">Producto</th>
                <th className="pb-4">Stock</th>
                <th className="pb-4">Stock mínimo</th>
                <th className="pb-4">Precio de venta</th>
              </tr>
            </thead>

            <tbody>
              {stockBajo.map((producto) => (
                <tr
                  key={producto.IDPRODUCTO}
                  className="border-b border-gray-100"
                >
                  <td className="py-4 font-semibold">
                    {producto.CODIGO}
                  </td>

                  <td className="py-4">
                    {producto.NOMBRE}
                  </td>

                  <td className="py-4 font-bold text-red-700">
                    {producto.STOCK}
                  </td>

                  <td className="py-4">
                    {producto.STOCK_MINIMO}
                  </td>

                  <td className="py-4">
                    S/{" "}
                    {Number(
                      producto.PRECIO_VENTA || 0
                    ).toFixed(2)}
                  </td>
                </tr>
              ))}

              {stockBajo.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="py-14 text-center text-gray-500"
                  >
                    No hay productos con stock bajo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function TablaVentas({ ventas }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900">
        Ventas recientes
      </h2>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[650px]">
          <thead>
            <tr className="border-b text-left text-sm text-gray-500">
              <th className="pb-4">Venta</th>
              <th className="pb-4">Cliente</th>
              <th className="pb-4">Método</th>
              <th className="pb-4">Total</th>
              <th className="pb-4">Estado</th>
            </tr>
          </thead>

          <tbody>
            {ventas.map((venta) => (
              <tr
                key={venta.IDVENTA}
                className="border-b border-gray-100"
              >
                <td className="py-4 font-semibold">
                  {venta.NUMERO_VENTA}
                </td>

                <td className="py-4">
                  {venta.CLIENTE}
                </td>

                <td className="py-4">
                  {venta.METODO_PAGO}
                </td>

                <td className="py-4 font-semibold text-red-700">
                  S/ {Number(venta.TOTAL).toFixed(2)}
                </td>

                <td className="py-4">
                  {venta.ESTADO}
                </td>
              </tr>
            ))}

            {ventas.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="py-14 text-center text-gray-500"
                >
                  No existen ventas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TablaReparaciones({ reparaciones }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900">
        Reparaciones recientes
      </h2>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[650px]">
          <thead>
            <tr className="border-b text-left text-sm text-gray-500">
              <th className="pb-4">Código</th>
              <th className="pb-4">Cliente</th>
              <th className="pb-4">Equipo</th>
              <th className="pb-4">Estado</th>
              <th className="pb-4">Costo</th>
            </tr>
          </thead>

          <tbody>
            {reparaciones.map((reparacion) => (
              <tr
                key={reparacion.IDREPARACION}
                className="border-b border-gray-100"
              >
                <td className="py-4 font-semibold">
                  {reparacion.CODIGO}
                </td>

                <td className="py-4">
                  {reparacion.CLIENTE}
                </td>

                <td className="py-4">
                  {reparacion.MARCA} {reparacion.MODELO}
                </td>

                <td className="py-4">
                  {reparacion.ESTADO_REPARACION}
                </td>

                <td className="py-4">
                  S/{" "}
                  {Number(
                    reparacion.COSTO_FINAL ??
                      reparacion.COSTO_ESTIMADO ??
                      0
                  ).toFixed(2)}
                </td>
              </tr>
            ))}

            {reparaciones.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="py-14 text-center text-gray-500"
                >
                  No existen reparaciones registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Reports;