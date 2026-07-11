import { useEffect, useState } from "react";
import {
  Users,
  Smartphone,
  Wrench,
  CheckCircle2,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

import { obtenerDashboard } from "../../../services/dashboardService";

function Dashboard() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarDashboard();
  }, []);

  async function cargarDashboard() {
    try {
      setCargando(true);
      setError("");

      const resultado = await obtenerDashboard();
      setDatos(resultado);
    } catch (errorCarga) {
      setError(errorCarga.message);
    } finally {
      setCargando(false);
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

  const { resumen, reparacionesRecientes } = datos;

  const tarjetas = [
    {
      titulo: "Clientes",
      valor: resumen.CLIENTES,
      icono: Users,
    },
    {
      titulo: "Equipos registrados",
      valor: resumen.EQUIPOS,
      icono: Smartphone,
    },
    {
      titulo: "Reparaciones activas",
      valor: resumen.REPARACIONES_ACTIVAS,
      icono: Wrench,
    },
    {
      titulo: "Listos para recoger",
      valor: resumen.LISTOS_PARA_RECOGER,
      icono: CheckCircle2,
    },
  ];

  return (
    <section>
      <p className="text-sm text-gray-500">
        Panel administrativo
      </p>

      <h1 className="mt-1 text-3xl font-bold text-gray-900">
        Dashboard
      </h1>

      <p className="mt-2 text-gray-600">
        Resumen general de Taurus.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
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

                  <h2 className="mt-2 text-3xl font-bold text-gray-900">
                    {tarjeta.valor}
                  </h2>
                </div>

                <div className="rounded-2xl bg-red-100 p-4">
                  <Icono className="text-red-700" size={28} />
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">
          Reparaciones recientes
        </h2>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[700px]">
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
              {reparacionesRecientes.map((reparacion) => (
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
                    <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                      {reparacion.ESTADO}
                    </span>
                  </td>

                  <td className="py-4 text-gray-600">
                    {new Intl.DateTimeFormat("es-PE").format(
                      new Date(reparacion.FECHA_INGRESO)
                    )}
                  </td>
                </tr>
              ))}

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
      </div>
    </section>
  );
}

export default Dashboard;