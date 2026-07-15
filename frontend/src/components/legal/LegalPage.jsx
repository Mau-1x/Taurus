import {
  ArrowLeft,
  CalendarDays,
  Mail,
  MapPin,
} from "lucide-react";

import { Link } from "react-router-dom";

const RESPONSABLE =
  "Fernando Hernandez de la Cruz";

const CORREO =
  "taurusx23@gmail.com";

const DIRECCION =
  "Calle Ayacucho 146, Ica, Perú, 11000";

function LegalPage({
  titulo,
  descripcion,
  icono: Icono,
  children,
}) {
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="relative overflow-hidden bg-black py-20 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-red-950" />

        <div className="relative mx-auto max-w-5xl px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-300 transition hover:text-white"
          >
            <ArrowLeft size={18} />
            Volver al inicio
          </Link>

          <div className="mt-8 flex items-start gap-4">
            <div className="rounded-2xl bg-red-700 p-4 text-white">
              <Icono size={30} />
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-red-400">
                Información legal
              </p>

              <h1 className="mt-2 text-4xl font-black leading-tight md:text-5xl">
                {titulo}
              </h1>

              <p className="mt-4 max-w-3xl text-lg leading-8 text-gray-300">
                {descripcion}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-5xl gap-8 px-6 lg:grid-cols-[1fr_280px]">
          <article className="space-y-8 rounded-3xl bg-white p-7 shadow-sm sm:p-10">
            {children}
          </article>

          <aside className="h-fit space-y-4 rounded-3xl border border-gray-200 bg-white p-6 lg:sticky lg:top-28">
            <h2 className="font-black text-gray-950">
              Responsable
            </h2>

            <Dato
              icono={Mail}
              titulo="Correo"
              texto={CORREO}
              enlace={`mailto:${CORREO}`}
            />

            <Dato
              icono={MapPin}
              titulo="Dirección"
              texto={DIRECCION}
            />

            <Dato
              icono={CalendarDays}
              titulo="Última actualización"
              texto="15 de julio de 2026"
            />

            <p className="border-t border-gray-200 pt-4 text-sm leading-6 text-gray-500">
              Responsable del tratamiento:
              {" "}
              <strong className="text-gray-800">
                {RESPONSABLE}
              </strong>
              .
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}

function LegalSection({
  titulo,
  children,
}) {
  return (
    <section>
      <h2 className="text-xl font-black text-gray-950">
        {titulo}
      </h2>

      <div className="mt-3 space-y-3 leading-7 text-gray-600">
        {children}
      </div>
    </section>
  );
}

function LegalList({ items }) {
  return (
    <ul className="list-disc space-y-2 pl-6">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function LegalNotice({ children }) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 leading-7 text-amber-950">
      {children}
    </div>
  );
}

function Dato({
  icono: Icono,
  titulo,
  texto,
  enlace,
}) {
  const contenido = (
    <>
      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
        {titulo}
      </p>

      <p className="mt-1 break-words text-sm font-semibold leading-6 text-gray-800">
        {texto}
      </p>
    </>
  );

  return (
    <div className="flex items-start gap-3">
      <div className="rounded-xl bg-red-50 p-2 text-red-700">
        <Icono size={18} />
      </div>

      {enlace ? (
        <a
          href={enlace}
          className="min-w-0 hover:underline"
        >
          {contenido}
        </a>
      ) : (
        <div className="min-w-0">
          {contenido}
        </div>
      )}
    </div>
  );
}

export {
  LegalPage,
  LegalSection,
  LegalList,
  LegalNotice,
};
