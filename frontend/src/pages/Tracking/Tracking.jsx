import { useState } from "react";
import {
  Search,
  Smartphone,
  CalendarDays,
  CheckCircle2,
  Circle,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

import { buscarReparacionPorCodigo } from "../../services/reparacionService";

function Tracking() {
  const [codigo, setCodigo] = useState("");
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function manejarBusqueda(event) {
    event.preventDefault();

    const codigoLimpio = codigo.trim();

    if (!codigoLimpio) {
      setError("Ingresa el código de reparación");
      return;
    }

    try {
      setCargando(true);
      setError("");
      setResultado(null);

      const datos = await buscarReparacionPorCodigo(codigoLimpio);
      setResultado(datos);
    } catch (errorBusqueda) {
      setError(errorBusqueda.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 py-16">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <span className="rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700">
            Seguimiento en línea
          </span>

          <h1 className="mt-6 text-4xl font-bold text-gray-900 md:text-5xl">
            Consulta el estado de tu equipo
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Ingresa el código recibido al registrar tu reparación.
          </p>
        </div>

        <form
          onSubmit={manejarBusqueda}
          className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 rounded-2xl bg-white p-4 shadow-lg sm:flex-row"
        >
          <input
            type="text"
            value={codigo}
            onChange={(event) => setCodigo(event.target.value)}
            placeholder="Ejemplo: TAU-175218..."
            className="min-w-0 flex-1 rounded-xl border border-gray-300 px-5 py-4 outline-none transition focus:border-red-600"
          />

          <button
            type="submit"
            disabled={cargando}
            className="flex items-center justify-center gap-2 rounded-xl bg-red-700 px-7 py-4 font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cargando ? (
              <LoaderCircle className="animate-spin" size={20} />
            ) : (
              <Search size={20} />
            )}

            {cargando ? "Buscando..." : "Consultar"}
          </button>
        </form>

        {error && (
          <div className="mx-auto mt-6 flex max-w-2xl items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle size={22} />
            <p>{error}</p>
          </div>
        )}

        {resultado && (
          <ResultadoSeguimiento datos={resultado} />
        )}
      </div>
    </main>
  );
}

function ResultadoSeguimiento({ datos }) {
  const { reparacion, historial } = datos;

  return (
    <section className="mt-12 overflow-hidden rounded-3xl bg-white shadow-xl">
      <div className="bg-gradient-to-r from-black to-red-900 p-8 text-white">
        <p className="text-sm text-gray-300">Orden de servicio</p>

        <h2 className="mt-1 text-3xl font-bold">
          {reparacion.CODIGO}
        </h2>

        <span className="mt-5 inline-flex rounded-full bg-white/15 px-4 py-2 font-semibold">
          {reparacion.ESTADO_REPARACION}
        </span>
      </div>

      <div className="grid gap-6 p-8 md:grid-cols-3">
        <Dato
          icono={Smartphone}
          titulo="Dispositivo"
          valor={`${reparacion.MARCA} ${reparacion.MODELO}`}
        />

        <Dato
          icono={CalendarDays}
          titulo="Fecha de ingreso"
          valor={formatearFecha(reparacion.FECHA_INGRESO)}
        />

        <Dato
          icono={CalendarDays}
          titulo="Entrega estimada"
          valor={formatearFecha(reparacion.FECHA_ESTIMADA)}
        />
      </div>

      <div className="border-t border-gray-200 p-8">
        <h3 className="text-2xl font-bold text-gray-900">
          Progreso de la reparación
        </h3>

        <div className="mt-8 space-y-2">
          {historial.map((item, index) => {
            const esUltimo = index === historial.length - 1;

            return (
              <div
                key={item.IDHISTORIAL}
                className="relative flex gap-5 pb-8"
              >
                {!esUltimo && (
                  <div className="absolute left-[13px] top-7 h-full w-0.5 bg-red-200" />
                )}

                <div className="relative z-10 bg-white">
                  {esUltimo ? (
                    <Circle
                      size={28}
                      className="fill-red-600 text-red-600"
                    />
                  ) : (
                    <CheckCircle2
                      size={28}
                      className="text-green-600"
                    />
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-gray-900">
                    {item.ESTADO}
                  </h4>

                  <p className="mt-1 text-sm text-gray-500">
                    {formatearFechaHora(item.FECHA)}
                  </p>

                  {item.COMENTARIO && (
                    <p className="mt-2 text-gray-600">
                      {item.COMENTARIO}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Dato({ icono: Icono, titulo, valor }) {
  return (
    <div className="rounded-2xl bg-gray-50 p-5">
      <Icono className="text-red-700" size={28} />

      <p className="mt-3 text-sm text-gray-500">
        {titulo}
      </p>

      <p className="mt-1 font-bold text-gray-900">
        {valor || "No especificado"}
      </p>
    </div>
  );
}

function formatearFecha(fecha) {
  if (!fecha) return "No especificada";

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(fecha));
}

function formatearFechaHora(fecha) {
  if (!fecha) return "Fecha no disponible";

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(fecha));
}

export default Tracking;