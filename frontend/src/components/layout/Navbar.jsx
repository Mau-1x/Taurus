import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Menu,
  X,
  Wrench,
  ShoppingBag,
  CalendarDays,
  Search,
  Home,
  MessageCircle,
} from "lucide-react";

const enlaces = [
  {
    nombre: "Inicio",
    ruta: "/",
    icono: Home,
  },
  {
    nombre: "Servicios",
    ruta: "/servicios",
    icono: Wrench,
  },
  {
    nombre: "Productos",
    ruta: "/productos",
    icono: ShoppingBag,
  },
  {
    nombre: "Reservas",
    ruta: "/reservas",
    icono: CalendarDays,
  },
  {
    nombre: "Seguimiento",
    ruta: "/seguimiento",
    icono: Search,
  },
  {
    nombre: "Contacto",
    ruta: "/contacto",
    icono: MessageCircle,
  },
];

function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  function cerrarMenu() {
    setMenuAbierto(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/95 text-white backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link
          to="/"
          onClick={cerrarMenu}
          className="flex items-center gap-3"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-700">
            <Wrench size={24} />
          </div>

          <div>
            <p className="text-xl font-bold text-white">
              Taurus
            </p>

            <p className="text-xs text-gray-400">
              Servicio técnico
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {enlaces.map((enlace) => (
            <NavLink
              key={enlace.ruta}
              to={enlace.ruta}
              className={({ isActive }) =>
                `rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-red-700 text-white"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              {enlace.nombre}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Link
            to="/login"
            className="rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold transition hover:border-red-600 hover:bg-red-700"
          >
            Acceso administrativo
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuAbierto((estado) => !estado)}
          aria-label={
            menuAbierto ? "Cerrar menú" : "Abrir menú"
          }
          className="rounded-xl border border-white/15 p-3 text-white transition hover:bg-white/10 lg:hidden"
        >
          {menuAbierto ? (
            <X size={24} />
          ) : (
            <Menu size={24} />
          )}
        </button>
      </div>

      {menuAbierto && (
        <div className="border-t border-white/10 bg-black px-6 pb-6 pt-4 lg:hidden">
          <nav className="space-y-2">
            {enlaces.map((enlace) => {
              const Icono = enlace.icono;

              return (
                <NavLink
                  key={enlace.ruta}
                  to={enlace.ruta}
                  onClick={cerrarMenu}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition ${
                      isActive
                        ? "bg-red-700 text-white"
                        : "text-gray-300 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  <Icono size={20} />
                  {enlace.nombre}
                </NavLink>
              );
            })}
          </nav>

          <Link
            to="/login"
            onClick={cerrarMenu}
            className="mt-5 block rounded-xl border border-white/20 px-5 py-3 text-center font-semibold transition hover:bg-red-700"
          >
            Acceso administrativo
          </Link>
        </div>
      )}
    </header>
  );
}

export default Navbar;