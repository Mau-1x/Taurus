import {
  LayoutDashboard,
  Users,
  Smartphone,
  Wrench,
  Package,
  ShoppingCart,
  CalendarDays,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../assets/logos/taurus-logo.png";

import {
  cerrarSesion,
  obtenerUsuario,
} from "../../services/authService";

const opciones = [
  {
    nombre: "Dashboard",
    ruta: "/admin/dashboard",
    icono: LayoutDashboard,
    roles: ["ADMINISTRADOR", "TECNICO", "VENDEDOR"],
  },
  {
    nombre: "Clientes",
    ruta: "/admin/clientes",
    icono: Users,
    roles: ["ADMINISTRADOR", "VENDEDOR"],
  },
  {
    nombre: "Equipos",
    ruta: "/admin/equipos",
    icono: Smartphone,
    roles: ["ADMINISTRADOR", "TECNICO"],
  },
  {
    nombre: "Reparaciones",
    ruta: "/admin/reparaciones",
    icono: Wrench,
    roles: ["ADMINISTRADOR", "TECNICO"],
  },
  {
    nombre: "Inventario",
    ruta: "/admin/inventario",
    icono: Package,
    roles: ["ADMINISTRADOR", "TECNICO", "VENDEDOR"],
  },
  {
    nombre: "Ventas",
    ruta: "/admin/ventas",
    icono: ShoppingCart,
    roles: ["ADMINISTRADOR", "VENDEDOR"],
  },
  {
    nombre: "Reservas",
    ruta: "/admin/reservas",
    icono: CalendarDays,
    roles: ["ADMINISTRADOR", "TECNICO", "VENDEDOR"],
  },
  {
    nombre: "Reportes",
    ruta: "/admin/reportes",
    icono: BarChart3,
    roles: ["ADMINISTRADOR"],
  },
  {
    nombre: "Configuración",
    ruta: "/admin/configuracion",
    icono: Settings,
    roles: ["ADMINISTRADOR"],
  },
];

function Sidebar() {
  const navigate = useNavigate();
  const usuario = obtenerUsuario();
  const opcionesPermitidas = opciones.filter((opcion) =>
  opcion.roles.includes(usuario?.rol)
  );

  function manejarCerrarSesion() {
    cerrarSesion();
    navigate("/login", { replace: true });
  }

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col bg-black text-white">
      <div className="flex items-center gap-3 border-b border-white/10 px-6 py-5">
        <img
          src={logo}
          alt="Taurus"
          className="h-11 w-11 rounded-full"
        />

        <div>
          <h1 className="font-bold text-red-500">
            Taurus
          </h1>

          <p className="text-xs text-gray-400">
            {usuario?.nombre || "Usuario"}
          </p>

          <p className="text-xs text-gray-500">
            {usuario?.rol || "Sin rol"}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
          {opcionesPermitidas.map((opcion) => {
          const Icono = opcion.icono;

          return (
            <NavLink
              key={opcion.ruta}
              to={opcion.ruta}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                  isActive
                    ? "bg-red-700 text-white"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icono size={20} />
              <span>{opcion.nombre}</span>
            </NavLink>
          );
        })}
      </nav>

      <button
        onClick={manejarCerrarSesion}
        className="m-4 flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3 text-gray-300 transition hover:bg-white/10"
      >
        <LogOut size={20} />
        Cerrar sesión
      </button>
    </aside>
  );
}

export default Sidebar;