import { Link } from "react-router-dom";
import {
  Wrench,
  MapPin,
  Phone,
  Mail,
  Clock3,
  Globe2,
  MessageCircle,
} from "lucide-react";

const enlacesRapidos = [
  { nombre: "Inicio", ruta: "/" },
  { nombre: "Servicios", ruta: "/servicios" },
  { nombre: "Productos", ruta: "/productos" },
  { nombre: "Reservas", ruta: "/reservas" },
  { nombre: "Seguimiento", ruta: "/seguimiento" },
];

const servicios = [
  "Cambio de pantalla",
  "Cambio de batería",
  "Puerto de carga",
  "Problemas de software",
  "Diagnóstico técnico",
];

function Footer() {
  const anioActual = new Date().getFullYear();

  return (
    <footer className="bg-black text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-2 xl:grid-cols-4">
        <section>
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-700">
              <Wrench size={25} />
            </div>

            <div>
              <p className="text-xl font-bold">Taurus</p>
              <p className="text-xs text-gray-400">
                Servicio técnico
              </p>
            </div>
          </Link>

          <p className="mt-5 max-w-sm leading-7 text-gray-400">
            Reparación de celulares y tablets, venta de accesorios,
            seguimiento de servicios y atención mediante reservas.
          </p>

          <div className="mt-6 flex gap-3">
            <a
              href="#"
              aria-label="Facebook"
              className="rounded-xl bg-white/10 p-3 text-gray-300 transition hover:bg-red-700 hover:text-white"
            >
              <Globe2 size={20} />
            </a>

            <a
                href="#"
                aria-label="Página web"
                className="rounded-xl bg-white/10 p-3 text-gray-300 transition hover:bg-red-700 hover:text-white"
              >
                <Globe2 size={20} />
              </a>

              <a
                href="https://wa.me/51987654321"
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="rounded-xl bg-white/10 p-3 text-gray-300 transition hover:bg-green-600 hover:text-white"
              >
                <MessageCircle size={20} />
              </a>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold">
            Enlaces rápidos
          </h2>

          <nav className="mt-5 space-y-3">
            {enlacesRapidos.map((enlace) => (
              <Link
                key={enlace.ruta}
                to={enlace.ruta}
                className="block text-gray-400 transition hover:translate-x-1 hover:text-red-500"
              >
                {enlace.nombre}
              </Link>
            ))}
          </nav>
        </section>

        <section>
          <h2 className="text-lg font-bold">
            Servicios
          </h2>

          <div className="mt-5 space-y-3">
            {servicios.map((servicio) => (
              <p
                key={servicio}
                className="text-gray-400"
              >
                {servicio}
              </p>
            ))}
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
              texto="Ica, Perú"
            />

            <Informacion
              icono={Phone}
              titulo="Celular"
              texto="+51 987 654 321"
            />

            <Informacion
              icono={Mail}
              titulo="Correo"
              texto="contacto@taurus.com"
            />

            <Informacion
              icono={Clock3}
              titulo="Horario"
              texto="Lunes a sábado, 9:00 a. m. - 7:00 p. m."
            />
          </div>
        </section>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
          <p>
            © {anioActual} Taurus. Todos los derechos reservados.
          </p>

          <p>
            Sistema de gestión para servicio técnico.
          </p>
        </div>
      </div>

      <a
        href="https://wa.me/51987654321?text=Hola%20Taurus,%20necesito%20información"
        target="_blank"
        rel="noreferrer"
        aria-label="Contactar por WhatsApp"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-xl transition hover:scale-110 hover:bg-green-700"
      >
        <MessageCircle size={28} />
      </a>
    </footer>
  );
}

function Informacion({ icono: Icono, titulo, texto }) {
  return (
    <div className="flex gap-3">
      <Icono
        size={20}
        className="mt-1 shrink-0 text-red-500"
      />

      <div>
        <p className="font-semibold text-gray-200">
          {titulo}
        </p>

        <p className="mt-1 text-sm leading-6 text-gray-400">
          {texto}
        </p>
      </div>
    </div>
  );
}

export default Footer;