import { Menu, ShoppingCart, User } from "lucide-react";
import logo from "../../assets/logos/taurus-logo.png";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-black text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer">
          <img
            src={logo}
            alt="Taurus"
            className="h-12 w-12 rounded-full"
          />

          <div>
            <h1 className="text-xl font-bold text-red-600">
              Taurus
            </h1>

            <p className="text-xs text-gray-300">
              Servicio Técnico Especializado
            </p>
          </div>
        </div>

        {/* Menú Desktop */}
        <nav className="hidden lg:flex items-center gap-8">

          <Link to="/inicio">Inicio</Link>

          <Link to="servicios/">Servicios</Link>

          <Link
            to="/productos"
            className="hover:text-red-500 transition"
          >
            Productos
          </Link>

          <Link to="/reservas">Reservas</Link>

          <Link
            to="/seguimiento"
            className="transition hover:text-red-500"
          >
            Seguimiento
          </Link>
          
          <Link to="/contacto">Contacto</Link>

        </nav>

        {/* Acciones */}
        <div className="hidden lg:flex items-center gap-5">

          <ShoppingCart className="cursor-pointer hover:text-red-500 transition" />

          <User className="cursor-pointer hover:text-red-500 transition" />

          <a
            href="https://wa.me/51999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-green-600 px-5 py-2 font-semibold hover:bg-green-700 transition"
          >
            WhatsApp
          </a>

          <button className="rounded-lg bg-red-700 px-5 py-2 font-semibold hover:bg-red-800 transition">
            Iniciar sesión
          </button>

        </div>

        {/* Menú móvil */}
        <button className="lg:hidden">
          <Menu size={30} />
        </button>

      </div>
    </header>
  );
}

export default Navbar;