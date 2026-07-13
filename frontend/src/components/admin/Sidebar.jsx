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
  X,
  ClipboardList,
} from "lucide-react";

import {
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useEffect } from "react";

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
    roles: [
      "ADMINISTRADOR",
      "TECNICO",
      "VENDEDOR",
    ],
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
    roles: [
      "ADMINISTRADOR",
      "TECNICO",
      "VENDEDOR",
    ],
  },
  {
    nombre: "Reportes",
    ruta: "/admin/reportes",
    icono: BarChart3,
    roles: ["ADMINISTRADOR"],
  },
  {
    nombre: "Auditoría",
    ruta: "/admin/auditoria",
    icono: ClipboardList,
    roles: ["ADMINISTRADOR"],
  },
  {
    nombre: "Configuración",
    ruta: "/admin/configuracion",
    icono: Settings,
    roles: ["ADMINISTRADOR"],
  },
];

function Sidebar({ abierto = false, cerrar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const usuario = obtenerUsuario();

  const opcionesPermitidas = opciones.filter((opcion) =>
    opcion.roles.includes(usuario?.rol)
  );
  useEffect(() => {
    if (window.innerWidth < 1024) {
      cerrar?.();
    }
  }, [location.pathname, cerrar]);

  function manejarCerrarSesion() {
    cerrarSesion();
    cerrar?.();
    navigate("/login", { replace: true });
  }

  return (
    <aside
      className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col bg-black text-white shadow-2xl transition-transform duration-300 lg:translate-x-0 ${
        abierto
          ? "translate-x-0"
          : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src={logo}
            alt="Taurus"
            className="h-11 w-11 shrink-0 rounded-full object-cover"
          />

          <div className="min-w-0">
            <h1 className="truncate font-bold text-red-500">
              Taurus
            </h1>

            <p className="truncate text-xs text-gray-300">
              {usuario?.nombre || "Usuario"}
            </p>

            <p className="truncate text-xs text-gray-500">
              {usuario?.rol || "Sin rol"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={cerrar}
          className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white lg:hidden"
        >
          <X size={22} />
        </button>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
        {opcionesPermitidas.map((opcion) => {
          const Icono = opcion.icono;

          return (
            <NavLink
              key={opcion.ruta}
              to={opcion.ruta}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-red-700 text-white"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icono size={20} className="shrink-0" />

              <span className="truncate">
                {opcion.nombre}
              </span>
            </NavLink>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={manejarCerrarSesion}
        className="m-4 flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3 text-gray-300 transition hover:bg-white/10 hover:text-white"
      >
        <LogOut size={20} />
        Cerrar sesión
      </button>
    </aside>
  );
}

export default Sidebar;