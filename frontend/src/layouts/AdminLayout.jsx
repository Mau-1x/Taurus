import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { useCallback, useState } from "react";

import Sidebar from "../components/admin/Sidebar";

function AdminLayout() {
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  function abrirSidebar() {
    setSidebarAbierto(true);
  }

  const cerrarSidebar = useCallback(() => {
    setSidebarAbierto(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar
        abierto={sidebarAbierto}
        cerrar={cerrarSidebar}
      />

      {sidebarAbierto && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={cerrarSidebar}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm lg:hidden">
        <button
          type="button"
          onClick={abrirSidebar}
          className="rounded-xl border border-gray-200 p-2.5 text-gray-700 transition hover:bg-gray-100"
        >
          <Menu size={24} />
        </button>

        <div className="text-right">
          <p className="font-bold text-gray-900">
            Taurus
          </p>

          <p className="text-xs text-gray-500">
            Panel administrativo
          </p>
        </div>
      </header>

      <main className="min-h-screen p-4 sm:p-6 lg:ml-64 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;