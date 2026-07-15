import {
  useMemo,
  useState,
} from "react";

import {
  MapPin,
  Phone,
  Clock3,
  MessageCircle,
  Send,
  Navigation,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

const DIRECCION =
  "Calle Ayacucho 146, Ica, Perú, 11000";

const HORARIO =
  "Lunes a sábado, 10:00 a. m. a 9:00 p. m.";

function normalizarWhatsApp(numeroConfigurado) {
  const numero = String(
    numeroConfigurado || ""
  ).replace(/\D/g, "");

  if (numero.length === 9) {
    return `51${numero}`;
  }

  if (
    numero.startsWith("51") &&
    numero.length === 11
  ) {
    return numero;
  }

  return "";
}

function Contact() {
  const [enviando, setEnviando] =
    useState(false);

  const numeroWhatsApp = useMemo(
    () =>
      normalizarWhatsApp(
        import.meta.env.VITE_WHATSAPP_NUMBER ||
          "51981089683"
      ),
    []
  );

  const direccionCodificada =
    encodeURIComponent(DIRECCION);

  const enlaceMapa =
    `https://www.google.com/maps/search/?api=1&query=${direccionCodificada}`;

  const mapaEmbebido =
    `https://www.google.com/maps?q=${direccionCodificada}&output=embed`;

  const mensajeInicial = encodeURIComponent(
    "Hola Taurus, necesito información sobre sus servicios."
  );

  const enlaceWhatsApp = numeroWhatsApp
    ? `https://wa.me/${numeroWhatsApp}?text=${mensajeInicial}`
    : "#";

  function enviarMensaje(evento) {
    evento.preventDefault();

    if (!numeroWhatsApp) {
      return;
    }

    const formulario =
      evento.currentTarget;

    const datos = new FormData(
      formulario
    );

    const nombre = String(
      datos.get("nombre") || ""
    ).trim();

    const celular = String(
      datos.get("celular") || ""
    ).trim();

    const asunto = String(
      datos.get("asunto") || ""
    ).trim();

    const mensaje = String(
      datos.get("mensaje") || ""
    ).trim();

    const texto = encodeURIComponent(
      `Hola Taurus, soy ${nombre}.\n\n` +
        `Celular: ${celular}\n` +
        `Asunto: ${asunto}\n` +
        `Mensaje: ${mensaje}`
    );

    setEnviando(true);

    window.open(
      `https://wa.me/${numeroWhatsApp}?text=${texto}`,
      "_blank",
      "noopener,noreferrer"
    );

    window.setTimeout(() => {
      setEnviando(false);
    }, 700);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="relative overflow-hidden bg-black py-24 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-red-950" />

        <div className="absolute -right-24 top-0 h-80 w-80 rounded-full bg-red-700/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-red-500">
            Atención al cliente
          </p>

          <h1 className="mt-4 text-4xl font-black md:text-6xl">
            Contacta con Taurus
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-300">
            Consulta servicios, disponibilidad de productos,
            reparaciones y reservas. Te atenderemos directamente
            por WhatsApp.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-gray-300">
            <Beneficio texto="Atención personalizada" />
            <Beneficio texto="Respuesta por WhatsApp" />
            <Beneficio texto="Ubicación en Ica" />
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[390px_1fr]">
          <aside className="space-y-5">
            <Dato
              icono={MapPin}
              titulo="Ubicación"
              texto={DIRECCION}
              enlace={enlaceMapa}
              textoEnlace="Abrir en Google Maps"
            />

            <Dato
              icono={Phone}
              titulo="WhatsApp"
              texto="+51 981 089 683"
              enlace={enlaceWhatsApp}
              textoEnlace="Escribir ahora"
            />

            <Dato
              icono={Clock3}
              titulo="Horario"
              texto={HORARIO}
            />

            <article className="rounded-2xl border border-red-100 bg-red-50 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-red-700 p-3 text-white">
                  <ShieldCheck size={23} />
                </div>

                <div>
                  <h2 className="font-bold text-gray-950">
                    Atención responsable
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    No realizamos una reparación sin informar
                    previamente el diagnóstico y el costo estimado.
                  </p>
                </div>
              </div>
            </article>

            <a
              href={enlaceWhatsApp}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-6 py-4 font-semibold text-white transition hover:bg-green-700"
            >
              <MessageCircle size={21} />
              Escribir por WhatsApp
            </a>
          </aside>

          <div className="space-y-8">
            <FormularioContacto
              enviarMensaje={enviarMensaje}
              enviando={enviando}
              numeroDisponible={Boolean(
                numeroWhatsApp
              )}
            />

            <section className="overflow-hidden rounded-3xl bg-white shadow-lg">
              <div className="flex flex-col gap-4 border-b p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-red-700">
                    Cómo llegar
                  </p>

                  <h2 className="mt-1 text-2xl font-black text-gray-950">
                    Encuéntranos en Ica
                  </h2>

                  <p className="mt-2 text-gray-500">
                    {DIRECCION}
                  </p>
                </div>

                <a
                  href={enlaceMapa}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:bg-red-700"
                >
                  <Navigation size={18} />
                  Ver ruta
                </a>
              </div>

              <iframe
                title="Ubicación de Taurus en Google Maps"
                src={mapaEmbebido}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[420px] w-full border-0"
                allowFullScreen
              />
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

function FormularioContacto({
  enviarMensaje,
  enviando,
  numeroDisponible,
}) {
  const [celular, setCelular] =
    useState("");

  function manejarCelular(evento) {
    const valor = evento.target.value
      .replace(/\D/g, "")
      .slice(0, 9);

    setCelular(valor);
  }

  return (
    <form
      onSubmit={enviarMensaje}
      className="grid gap-5 rounded-3xl bg-white p-7 shadow-lg md:grid-cols-2"
    >
      <div className="md:col-span-2">
        <p className="text-sm font-bold uppercase tracking-wider text-red-700">
          Consulta directa
        </p>

        <h2 className="mt-2 text-2xl font-black text-gray-950">
          Envíanos un mensaje
        </h2>

        <p className="mt-2 text-gray-500">
          Al enviar, se abrirá WhatsApp con el mensaje preparado.
        </p>
      </div>

      <Campo
        label="Nombre completo"
        name="nombre"
        autoComplete="name"
        maxLength={100}
        required
      />

      <label>
        <span className="mb-2 block text-sm font-semibold text-gray-700">
          Celular
          <span className="text-red-600"> *</span>
        </span>

        <input
          name="celular"
          value={celular}
          onChange={manejarCelular}
          inputMode="numeric"
          autoComplete="tel"
          minLength={9}
          maxLength={9}
          pattern="[0-9]{9}"
          required
          placeholder="987654321"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600"
        />
      </label>

      <div className="md:col-span-2">
        <Campo
          label="Asunto"
          name="asunto"
          maxLength={120}
          required
        />
      </div>

      <label className="md:col-span-2">
        <span className="mb-2 flex items-center justify-between text-sm font-semibold text-gray-700">
          <span>
            Mensaje
            <span className="text-red-600"> *</span>
          </span>
        </span>

        <textarea
          name="mensaje"
          rows="6"
          maxLength={1000}
          required
          placeholder="Cuéntanos qué problema presenta tu equipo o qué producto necesitas"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600"
        />
      </label>

      {!numeroDisponible && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 md:col-span-2">
          Configura VITE_WHATSAPP_NUMBER para habilitar
          el envío.
        </div>
      )}

      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={
            enviando ||
            !numeroDisponible
          }
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-700 px-6 py-4 font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send size={20} />
          {enviando
            ? "Abriendo WhatsApp..."
            : "Enviar mensaje"}
        </button>
      </div>
    </form>
  );
}

function Campo({
  label,
  name,
  required = false,
  maxLength,
  autoComplete,
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
        {required && (
          <span className="text-red-600"> *</span>
        )}
      </span>

      <input
        name={name}
        required={required}
        maxLength={maxLength}
        autoComplete={autoComplete}
        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600"
      />
    </label>
  );
}

function Dato({
  icono: Icono,
  titulo,
  texto,
  enlace,
  textoEnlace,
}) {
  return (
    <article className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700">
        <Icono size={23} />
      </div>

      <div>
        <h2 className="font-bold text-gray-900">
          {titulo}
        </h2>

        <p className="mt-1 leading-6 text-gray-600">
          {texto}
        </p>

        {enlace && (
          <a
            href={enlace}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex text-sm font-semibold text-red-700 hover:underline"
          >
            {textoEnlace}
          </a>
        )}
      </div>
    </article>
  );
}

function Beneficio({ texto }) {
  return (
    <span className="inline-flex items-center gap-2">
      <CheckCircle2
        size={18}
        className="text-red-500"
      />
      {texto}
    </span>
  );
}

export default Contact;
