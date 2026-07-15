import { Link } from "react-router-dom";

import {
  Wrench,
  MapPin,
  Phone,
  Clock3,
  Globe2,
  MessageCircle,
  Music2,
  Navigation,
  FileText,
  ShieldCheck,
  Camera,
  Database,
} from "lucide-react";

const enlacesRapidos = [
  {
    nombre: "Inicio",
    ruta: "/",
  },
  {
    nombre: "Servicios",
    ruta: "/servicios",
  },
  {
    nombre: "Productos",
    ruta: "/productos",
  },
  {
    nombre: "Reservas",
    ruta: "/reservas",
  },
  {
    nombre: "Seguimiento",
    ruta: "/seguimiento",
  },
  {
    nombre: "Contacto",
    ruta: "/contacto",
  },
];

const enlacesLegales = [
  {
    nombre: "Privacidad",
    ruta: "/privacidad",
    icono: Database,
  },
  {
    nombre: "Términos",
    ruta: "/terminos",
    icono: FileText,
  },
  {
    nombre: "Garantías",
    ruta: "/politica-garantias",
    icono: ShieldCheck,
  },
  {
    nombre: "Uso de fotografías",
    ruta: "/autorizacion-fotos",
    icono: Camera,
  },
];

const servicios = [
  "Cambio de pantalla",
  "Cambio de batería",
  "Puerto de carga",
  "Problemas de software",
  "Diagnóstico técnico",
];

const DIRECCION =
  "Calle Ayacucho 146, Ica, Perú, 11000";

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

function Footer() {
  const anioActual =
    new Date().getFullYear();

  const numeroWhatsApp =
    normalizarWhatsApp(
      import.meta.env.VITE_WHATSAPP_NUMBER ||
        "51981089683"
    );

  const enlaceWhatsApp =
    numeroWhatsApp
      ? `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(
          "Hola Taurus, necesito información."
        )}`
      : "";

  const direccionCodificada =
    encodeURIComponent(DIRECCION);

  const enlaceMapa =
    `https://www.google.com/maps/search/?api=1&query=${direccionCodificada}`;

  const facebookUrl =
    import.meta.env.VITE_FACEBOOK_URL ||
    "https://www.facebook.com/search/top?q=Taurus%20Ica";

  const tiktokUrl =
    import.meta.env.VITE_TIKTOK_URL ||
    "https://www.tiktok.com/@taurus_icax";

  return (
    <footer className="bg-black text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-2 xl:grid-cols-5">
        <section>
          <Link
            to="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-700">
              <Wrench size={25} />
            </div>

            <div>
              <p className="text-xl font-bold">
                Taurus
              </p>

              <p className="text-xs text-gray-400">
                Servicio técnico
              </p>
            </div>
          </Link>

          <p className="mt-5 max-w-sm leading-7 text-gray-400">
            Reparación de celulares y tablets,
            venta de accesorios, reservas y
            seguimiento en línea.
          </p>

          <div className="mt-6 flex gap-3">
            <a
              href={facebookUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Buscar Taurus en Facebook"
              title="Facebook"
              className="rounded-xl bg-white/10 p-3 text-gray-300 transition hover:bg-blue-700 hover:text-white"
            >
              <Globe2 size={20} />
            </a>

            <a
              href={tiktokUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Taurus en TikTok"
              title="TikTok"
              className="rounded-xl bg-white/10 p-3 text-gray-300 transition hover:bg-white hover:text-black"
            >
              <Music2 size={20} />
            </a>

            {enlaceWhatsApp && (
              <a
                href={enlaceWhatsApp}
                target="_blank"
                rel="noreferrer"
                aria-label="Taurus en WhatsApp"
                title="WhatsApp"
                className="rounded-xl bg-white/10 p-3 text-gray-300 transition hover:bg-green-600 hover:text-white"
              >
                <MessageCircle size={20} />
              </a>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold">
            Enlaces rápidos
          </h2>

          <nav className="mt-5 space-y-3">
            {enlacesRapidos.map(
              (enlace) => (
                <Link
                  key={enlace.ruta}
                  to={enlace.ruta}
                  className="block text-gray-400 transition hover:translate-x-1 hover:text-red-500"
                >
                  {enlace.nombre}
                </Link>
              )
            )}
          </nav>
        </section>

        <section>
          <h2 className="text-lg font-bold">
            Información legal
          </h2>

          <nav className="mt-5 space-y-3">
            {enlacesLegales.map(
              (enlace) => {
                const Icono =
                  enlace.icono;

                return (
                  <Link
                    key={enlace.ruta}
                    to={enlace.ruta}
                    className="flex items-center gap-2 text-gray-400 transition hover:translate-x-1 hover:text-red-500"
                  >
                    <Icono size={16} />
                    {enlace.nombre}
                  </Link>
                );
              }
            )}
          </nav>
        </section>

        <section>
          <h2 className="text-lg font-bold">
            Servicios
          </h2>

          <div className="mt-5 space-y-3">
            {servicios.map(
              (servicio) => (
                <p
                  key={servicio}
                  className="text-gray-400"
                >
                  {servicio}
                </p>
              )
            )}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold">
            Contacto
          </h2>

          <div className="mt-5 space-y-5">
            <Informacion
              icono={MapPin}
              titulo="Ubicación"
              texto={DIRECCION}
              enlace={enlaceMapa}
            />

            <Informacion
              icono={Phone}
              titulo="WhatsApp"
              texto="+51 981 089 683"
              enlace={enlaceWhatsApp}
            />

            <Informacion
              icono={Clock3}
              titulo="Horario"
              texto="Lunes a sábado, 10:00 a. m. a 9:00 p. m."
            />

            <a
              href={enlaceMapa}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-gray-200 transition hover:border-red-600 hover:bg-red-700"
            >
              <Navigation size={17} />
              Cómo llegar
            </a>
          </div>
        </section>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
          <p>
            © {anioActual} Taurus.
            Todos los derechos reservados.
          </p>

          <p>
            Responsable:
            {" "}
            Fernando Hernandez de la Cruz
          </p>
        </div>
      </div>
    </footer>
  );
}

function Informacion({
  icono: Icono,
  titulo,
  texto,
  enlace,
}) {
  const contenido = (
    <>
      <p className="font-semibold text-gray-200">
        {titulo}
      </p>

      <p className="mt-1 text-sm leading-6 text-gray-400">
        {texto}
      </p>
    </>
  );

  return (
    <div className="flex gap-3">
      <Icono
        size={20}
        className="mt-1 shrink-0 text-red-500"
      />

      {enlace ? (
        <a
          href={enlace}
          target="_blank"
          rel="noreferrer"
          className="transition hover:text-white"
        >
          {contenido}
        </a>
      ) : (
        <div>{contenido}</div>
      )}
    </div>
  );
}

export default Footer;
