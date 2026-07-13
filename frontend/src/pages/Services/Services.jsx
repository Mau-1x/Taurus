import { Link } from "react-router-dom";
import {
  Smartphone,
  BatteryCharging,
  PlugZap,
  Cpu,
  SearchCheck,
  Unlock,
  ArrowRight,
  ShieldCheck,
  Clock3,
  Wrench,
  CircleCheck,
  CalendarClock,
} from "lucide-react";

const servicios = [
  {
    titulo: "Cambio de pantalla",
    descripcion:
      "Reemplazo de pantallas rotas, con manchas, líneas o problemas táctiles.",
    icono: Smartphone,
    reserva: "Cambio de pantalla",
    tiempo: "1 a 3 horas",
    garantia: "Hasta 30 días",
    incluye: [
      "Diagnóstico de pantalla",
      "Instalación del repuesto",
      "Prueba de imagen y táctil",
    ],
  },
  {
    titulo: "Cambio de batería",
    descripcion:
      "Solución para baterías que duran poco, se apagan o presentan fallas de carga.",
    icono: BatteryCharging,
    reserva: "Cambio de batería",
    tiempo: "1 a 2 horas",
    garantia: "Hasta 30 días",
    incluye: [
      "Revisión del consumo",
      "Cambio de batería",
      "Prueba de carga",
    ],
  },
  {
    titulo: "Puerto de carga",
    descripcion:
      "Reparación o reemplazo del conector cuando el equipo no carga correctamente.",
    icono: PlugZap,
    reserva: "Reparación de puerto de carga",
    tiempo: "2 a 5 horas",
    garantia: "Hasta 30 días",
    incluye: [
      "Limpieza del conector",
      "Diagnóstico de carga",
      "Reparación o reemplazo",
    ],
  },
  {
    titulo: "Problemas de software",
    descripcion:
      "Revisión de lentitud, errores del sistema, bloqueos y aplicaciones defectuosas.",
    icono: Cpu,
    reserva: "Problema de software",
    tiempo: "1 a 4 horas",
    garantia: "Según el servicio",
    incluye: [
      "Diagnóstico del sistema",
      "Corrección de errores",
      "Pruebas de funcionamiento",
    ],
  },
  {
    titulo: "Diagnóstico técnico",
    descripcion:
      "Evaluación completa para detectar el origen real de la falla del dispositivo.",
    icono: SearchCheck,
    reserva: "Diagnóstico general",
    tiempo: "30 a 60 minutos",
    garantia: "No aplica",
    incluye: [
      "Revisión del equipo",
      "Identificación de la falla",
      "Presupuesto estimado",
    ],
  },
  {
    titulo: "Liberación de equipos",
    descripcion:
      "Revisión y soporte para equipos compatibles con procesos de liberación.",
    icono: Unlock,
    reserva: "Liberación de equipo",
    tiempo: "Según modelo",
    garantia: "Según compatibilidad",
    incluye: [
      "Revisión del modelo",
      "Validación de compatibilidad",
      "Prueba de funcionamiento",
    ],
  },
];

function Services() {
  return (
    <main className="bg-gray-50">
      <section className="relative overflow-hidden bg-black py-24 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-red-950" />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400">
              <Wrench size={17} />
              Servicio técnico especializado
            </span>

            <h1 className="mt-6 text-4xl font-bold leading-tight md:text-6xl">
              Soluciones para tu celular o tablet
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-300">
              Diagnosticamos y reparamos diferentes fallas de hardware y
              software con seguimiento durante todo el proceso.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/reservas"
                className="inline-flex items-center gap-2 rounded-xl bg-red-700 px-6 py-4 font-semibold text-white transition hover:bg-red-800"
              >
                Reservar una cita
                <ArrowRight size={20} />
              </Link>

              <Link
                to="/seguimiento"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-4 font-semibold text-white transition hover:bg-white/10"
              >
                Consultar reparación
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-red-700">
              Nuestros servicios
            </p>

            <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl">
              Atención técnica para diferentes problemas
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              Selecciona el servicio que necesitas y reserva una fecha para
              revisar tu equipo.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {servicios.map((servicio) => {
              const Icono = servicio.icono;

              <div className="mt-10 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
                <p className="font-semibold text-yellow-900">
                  Los tiempos y garantías son referenciales
                </p>

                <p className="mt-2 text-sm leading-6 text-yellow-800">
                  El tiempo final, el costo y la garantía dependen del modelo,
                  la disponibilidad del repuesto y el diagnóstico técnico.
                  No realizamos ninguna reparación sin la aprobación previa
                  del cliente.
                </p>
              </div>

              return (
                <article
                  key={servicio.titulo}
                  className="group rounded-3xl border border-gray-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-red-200 hover:shadow-xl"
                >
                  <div className="inline-flex rounded-2xl bg-red-100 p-4 text-red-700 transition group-hover:bg-red-700 group-hover:text-white">
                    <Icono size={30} />
                  </div>

                  <h3 className="mt-6 text-xl font-bold text-gray-900">
                    {servicio.titulo}
                  </h3>

                  <p className="mt-3 leading-7 text-gray-600">
                    {servicio.descripcion}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-gray-50 p-3">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <CalendarClock size={17} />
                        Tiempo estimado
                      </div>

                      <p className="mt-1 font-semibold text-gray-900">
                        {servicio.tiempo}
                      </p>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-3">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <ShieldCheck size={17} />
                        Garantía
                      </div>

                      <p className="mt-1 font-semibold text-gray-900">
                        {servicio.garantia}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="text-sm font-bold text-gray-800">
                      El servicio incluye:
                    </p>

                    <ul className="mt-3 space-y-2">
                      {servicio.incluye.map((elemento) => (
                        <li
                          key={elemento}
                          className="flex items-start gap-2 text-sm text-gray-600"
                        >
                          <CircleCheck
                            size={17}
                            className="mt-0.5 shrink-0 text-green-600"
                          />

                          {elemento}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    to={`/reservas?servicio=${encodeURIComponent(
                      servicio.reserva
                    )}`}
                    className="mt-6 inline-flex items-center gap-2 font-semibold text-red-700 transition hover:gap-3"
                  >
                    Reservar servicio
                    <ArrowRight size={18} />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Caracteristica
              icono={SearchCheck}
              titulo="Diagnóstico"
              descripcion="Revisamos el equipo antes de realizar cualquier reparación."
            />

            <Caracteristica
              icono={ShieldCheck}
              titulo="Trabajo responsable"
              descripcion="Registramos la falla, solución, costos y garantía del servicio."
            />

            <Caracteristica
              icono={Clock3}
              titulo="Seguimiento"
              descripcion="Consulta desde la web el avance de tu reparación usando tu código."
            />
          </div>
        </div>
      </section>

      <section className="bg-red-800 py-16 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 text-center lg:flex-row lg:text-left">
          <div>
            <h2 className="text-3xl font-bold">
              ¿Tu equipo presenta una falla?
            </h2>

            <p className="mt-3 text-red-100">
              Reserva una revisión y describe el problema antes de visitarnos.
            </p>
          </div>

          <Link
            to="/reservas"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-4 font-bold text-red-800 transition hover:bg-gray-100"
          >
            Reservar ahora
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </main>
  );
}

function Caracteristica({ icono: Icono, titulo, descripcion }) {
  return (
    <article className="rounded-3xl bg-gray-50 p-7">
      <div className="inline-flex rounded-2xl bg-black p-4 text-white">
        <Icono size={27} />
      </div>

      <h3 className="mt-5 text-xl font-bold text-gray-900">
        {titulo}
      </h3>

      <p className="mt-3 leading-7 text-gray-600">
        {descripcion}
      </p>
    </article>
  );
}

export default Services;