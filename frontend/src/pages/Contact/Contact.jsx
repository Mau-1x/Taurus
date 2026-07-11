import {
  MapPin,
  Phone,
  Mail,
  Clock3,
  MessageCircle,
  Send,
} from "lucide-react";

function Contact() {
  const whatsapp =
    "https://wa.me/51987654321?text=Hola%20Taurus,%20necesito%20información";

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-black py-20 text-white">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-red-500">
            Atención al cliente
          </p>

          <h1 className="mt-4 text-4xl font-bold md:text-6xl">
            Contáctanos
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-300">
            Escríbenos para consultar precios, disponibilidad de productos o
            servicios de reparación.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[380px_1fr]">
          <aside className="space-y-5">
            <Dato
              icono={MapPin}
              titulo="Ubicación"
              texto="Ica, Perú"
            />

            <Dato
              icono={Phone}
              titulo="Celular"
              texto="+51 987 654 321"
            />

            <Dato
              icono={Mail}
              titulo="Correo"
              texto="contacto@taurus.com"
            />

            <Dato
              icono={Clock3}
              titulo="Horario"
              texto="Lunes a sábado, 9:00 a. m. a 7:00 p. m."
            />

            <a
              href={whatsapp}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-6 py-4 font-semibold text-white transition hover:bg-green-700"
            >
              <MessageCircle size={21} />
              Escribir por WhatsApp
            </a>
          </aside>

          <FormularioContacto whatsapp={whatsapp} />
        </div>
      </section>
    </main>
  );
}

function FormularioContacto({ whatsapp }) {
  function enviarMensaje(evento) {
    evento.preventDefault();

    const datos = new FormData(evento.currentTarget);

    const nombre = datos.get("nombre");
    const celular = datos.get("celular");
    const asunto = datos.get("asunto");
    const mensaje = datos.get("mensaje");

    const texto = encodeURIComponent(
      `Hola Taurus, soy ${nombre}.\n` +
        `Celular: ${celular}\n` +
        `Asunto: ${asunto}\n` +
        `Mensaje: ${mensaje}`
    );

    const numero = whatsapp.split("?")[0];

    window.open(`${numero}?text=${texto}`, "_blank");
  }

  return (
    <form
      onSubmit={enviarMensaje}
      className="grid gap-5 rounded-3xl bg-white p-7 shadow-lg md:grid-cols-2"
    >
      <div className="md:col-span-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Envíanos un mensaje
        </h2>

        <p className="mt-2 text-gray-500">
          El mensaje se abrirá directamente en WhatsApp.
        </p>
      </div>

      <Campo
        label="Nombre completo"
        name="nombre"
        required
      />

      <Campo
        label="Celular"
        name="celular"
        required
      />

      <div className="md:col-span-2">
        <Campo
          label="Asunto"
          name="asunto"
          required
        />
      </div>

      <label className="md:col-span-2">
        <span className="mb-2 block text-sm font-semibold text-gray-700">
          Mensaje *
        </span>

        <textarea
          name="mensaje"
          rows="6"
          required
          placeholder="Cuéntanos en qué podemos ayudarte"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600"
        />
      </label>

      <div className="md:col-span-2">
        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-700 px-6 py-4 font-semibold text-white transition hover:bg-red-800">
          <Send size={20} />
          Enviar mensaje
        </button>
      </div>
    </form>
  );
}

function Campo({ label, name, required = false }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </span>

      <input
        name={name}
        required={required}
        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600"
      />
    </label>
  );
}

function Dato({ icono: Icono, titulo, texto }) {
  return (
    <article className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700">
        <Icono size={23} />
      </div>

      <div>
        <h2 className="font-bold text-gray-900">
          {titulo}
        </h2>

        <p className="mt-1 text-gray-600">
          {texto}
        </p>
      </div>
    </article>
  );
}

export default Contact;