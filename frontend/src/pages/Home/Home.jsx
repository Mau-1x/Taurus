import { Link } from "react-router-dom";
import {
  ArrowRight,
  Wrench,
  Smartphone,
  BatteryCharging,
  PlugZap,
  SearchCheck,
  ShieldCheck,
  Clock3,
  PackageCheck,
  CalendarDays,
  ScanSearch,
  CheckCircle2,
} from "lucide-react";

const servicios = [
  {
    titulo: "Cambio de pantalla",
    descripcion:
      "Reemplazo de pantallas rotas, con manchas o problemas táctiles.",
    icono: Smartphone,
  },
  {
    titulo: "Cambio de batería",
    descripcion:
      "Solución para equipos que se apagan o tienen poca duración.",
    icono: BatteryCharging,
  },
  {
    titulo: "Puerto de carga",
    descripcion:
      "Reparación cuando el equipo no carga o pierde conexión.",
    icono: PlugZap,
  },
  {
    titulo: "Diagnóstico técnico",
    descripcion:
      "Evaluación completa para identificar el origen de la falla.",
    icono: SearchCheck,
  },
];

const pasos = [
  {
    numero: "01",
    titulo: "Reserva tu cita",
    descripcion:
      "Selecciona el servicio, la fecha y la hora de atención.",
    icono: CalendarDays,
  },
  {
    numero: "02",
    titulo: "Revisamos tu equipo",
    descripcion:
      "Registramos la falla y realizamos el diagnóstico técnico.",
    icono: ScanSearch,
  },
  {
    numero: "03",
    titulo: "Seguimiento en línea",
    descripcion:
      "Consulta el avance de la reparación usando tu código.",
    icono: Clock3,
  },
  {
    numero: "04",
    titulo: "Recoge tu dispositivo",
    descripcion:
      "Te informamos cuando el equipo esté listo para entregar.",
    icono: PackageCheck,
  },
];

function Home() {
  return (
    <main className="bg-gray-50">
      <section className="relative overflow-hidden bg-black text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-red-950" />

        <div className="absolute -right-32 top-10 h-96 w-96 rounded-full bg-red-700/20 blur-3xl" />

        <div className="relative mx-auto grid min-h-[680px] max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400">
              <Wrench size={17} />
              Servicio técnico especializado
            </span>

            <h1 className="mt-7 text-4xl font-bold leading-tight md:text-6xl">
              Reparación y cuidado para tu dispositivo
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-gray-300">
              Diagnosticamos y reparamos celulares y tablets. Además,
              ofrecemos accesorios, reservas en línea y seguimiento del
              servicio técnico.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/reservas"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-700 px-6 py-4 font-semibold text-white transition hover:bg-red-800"
              >
                Reservar una cita
                <ArrowRight size={20} />
              </Link>

              <Link
                to="/seguimiento"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-4 font-semibold text-white transition hover:bg-white/10"
              >
                Consultar reparación
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-6 text-sm text-gray-300">
              <Beneficio texto="Diagnóstico registrado" />
              <Beneficio texto="Seguimiento en línea" />
              <Beneficio texto="Control de garantía" />
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
              <div className="rounded-3xl bg-white p-7 text-gray-900">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Estado de reparación
                    </p>

                    <p className="mt-1 text-2xl font-bold">
                      En diagnóstico
                    </p>
                  </div>

                  <div className="rounded-2xl bg-red-100 p-4 text-red-700">
                    <Smartphone size={32} />
                  </div>
                </div>

                <div className="mt-8 space-y-6">
                  <PasoEstado
                    titulo="Equipo recibido"
                    descripcion="Dispositivo registrado correctamente"
                    completado
                  />

                  <PasoEstado
                    titulo="Diagnóstico técnico"
                    descripcion="Revisión de componentes y falla"
                    completado
                  />

                  <PasoEstado
                    titulo="Proceso de reparación"
                    descripcion="Pendiente de aprobación"
                  />
                </div>

                <Link
                  to="/seguimiento"
                  className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-4 font-semibold text-white transition hover:bg-red-700"
                >
                  Consultar con mi código
                  <ArrowRight size={19} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-8">
        <div className="mx-auto grid max-w-6xl gap-4 px-6 sm:grid-cols-2 lg:grid-cols-4">
          <Dato titulo="Atención" valor="Personalizada" />
          <Dato titulo="Servicios" valor="Especializados" />
          <Dato titulo="Seguimiento" valor="En línea" />
          <Dato titulo="Inventario" valor="Actualizado" />
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-red-700">
                Servicios
              </p>

              <h2 className="mt-3 max-w-2xl text-3xl font-bold text-gray-900 md:text-4xl">
                Soluciones para los problemas más comunes
              </h2>
            </div>

            <Link
              to="/servicios"
              className="inline-flex items-center gap-2 font-semibold text-red-700"
            >
              Ver todos los servicios
              <ArrowRight size={19} />
            </Link>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {servicios.map((servicio) => {
              const Icono = servicio.icono;

              return (
                <article
                  key={servicio.titulo}
                  className="group rounded-3xl border border-gray-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-red-200 hover:shadow-xl"
                >
                  <div className="inline-flex rounded-2xl bg-red-100 p-4 text-red-700 transition group-hover:bg-red-700 group-hover:text-white">
                    <Icono size={29} />
                  </div>

                  <h3 className="mt-6 text-xl font-bold text-gray-900">
                    {servicio.titulo}
                  </h3>

                  <p className="mt-3 leading-7 text-gray-600">
                    {servicio.descripcion}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-red-700">
              Proceso de atención
            </p>

            <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl">
              Así funciona nuestro servicio
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              Desde la reserva hasta la entrega, podrás conocer el estado de tu
              equipo durante todo el proceso.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {pasos.map((paso) => {
              const Icono = paso.icono;

              return (
                <article
                  key={paso.numero}
                  className="relative rounded-3xl bg-gray-50 p-7"
                >
                  <span className="absolute right-6 top-5 text-4xl font-bold text-gray-200">
                    {paso.numero}
                  </span>

                  <div className="inline-flex rounded-2xl bg-black p-4 text-white">
                    <Icono size={27} />
                  </div>

                  <h3 className="mt-6 text-xl font-bold text-gray-900">
                    {paso.titulo}
                  </h3>

                  <p className="mt-3 leading-7 text-gray-600">
                    {paso.descripcion}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-black p-9 text-white md:p-12">
            <ShieldCheck size={44} className="text-red-500" />

            <h2 className="mt-6 text-3xl font-bold">
              Controlamos cada etapa de la reparación
            </h2>

            <p className="mt-5 leading-8 text-gray-300">
              Taurus registra la falla reportada, diagnóstico, solución,
              costos, estados y garantía del servicio realizado.
            </p>

            <Link
              to="/reservas"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-red-700 px-6 py-4 font-semibold transition hover:bg-red-800"
            >
              Reservar revisión
              <ArrowRight size={19} />
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Ventaja
              icono={Clock3}
              titulo="Seguimiento"
              descripcion="Consulta el estado del equipo desde cualquier dispositivo."
            />

            <Ventaja
              icono={ShieldCheck}
              titulo="Garantía"
              descripcion="Registramos los días de garantía de cada reparación."
            />

            <Ventaja
              icono={PackageCheck}
              titulo="Repuestos"
              descripcion="Control de productos y repuestos disponibles."
            />

            <Ventaja
              icono={CalendarDays}
              titulo="Reservas"
              descripcion="Solicita atención indicando fecha, hora y servicio."
            />
          </div>
        </div>
      </section>

      <section className="bg-red-800 py-16 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-7 px-6 text-center lg:flex-row lg:text-left">
          <div>
            <h2 className="text-3xl font-bold">
              ¿Necesitas revisar tu dispositivo?
            </h2>

            <p className="mt-3 text-red-100">
              Reserva una cita y cuéntanos qué problema presenta tu equipo.
            </p>
          </div>

          <Link
            to="/reservas"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-4 font-bold text-red-800 transition hover:bg-gray-100"
          >
            Reservar ahora
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </main>
  );
}

function Beneficio({ texto }) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2 size={18} className="text-red-500" />
      {texto}
    </div>
  );
}

function PasoEstado({ titulo, descripcion, completado = false }) {
  return (
    <div className="flex gap-4">
      <div
        className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
          completado
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-400"
        }`}
      >
        <CheckCircle2 size={18} />
      </div>

      <div>
        <p className="font-bold">{titulo}</p>
        <p className="mt-1 text-sm text-gray-500">{descripcion}</p>
      </div>
    </div>
  );
}

function Dato({ titulo, valor }) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-lg">
      <p className="text-sm text-gray-500">{titulo}</p>
      <p className="mt-1 text-lg font-bold text-gray-900">{valor}</p>
    </article>
  );
}

function Ventaja({ icono: Icono, titulo, descripcion }) {
  return (
    <article className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">
      <div className="inline-flex rounded-2xl bg-red-100 p-4 text-red-700">
        <Icono size={27} />
      </div>

      <h3 className="mt-5 text-xl font-bold text-gray-900">{titulo}</h3>

      <p className="mt-3 leading-7 text-gray-600">{descripcion}</p>
    </article>
  );
}

export default Home;