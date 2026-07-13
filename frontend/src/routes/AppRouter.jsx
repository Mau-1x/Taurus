import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";

import Home from "../pages/Home/Home";
import Services from "../pages/Services/Services";
import Products from "../pages/Products/Products";
import Reservations from "../pages/Reservations/Reservations";
import Tracking from "../pages/Tracking/Tracking";
import Contact from "../pages/Contact/Contact";
import Login from "../pages/Login/Login";
import Unauthorized from "../pages/Unauthorized/Unauthorized";
import NotFound from "../pages/NotFound/NotFound";

import Dashboard from "../pages/admin/Dashboard/Dashboard";
import Clients from "../pages/admin/Clients/Clients";
import Equipment from "../pages/admin/Equipment/Equipment";
import Repairs from "../pages/admin/Repairs/Repairs";
import Inventory from "../pages/admin/Inventory/Inventory";
import Sales from "../pages/admin/Sales/Sales";
import ReservationsAdmin from "../pages/admin/ReservationsAdmin/ReservationsAdmin";
import Reports from "../pages/admin/Reports/Reports";
import Settings from "../pages/admin/Settings/Settings";
import Audit from "../pages/admin/Audit/Audit";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/servicios" element={<Services />} />
          <Route path="/productos" element={<Products />} />
          <Route path="/reservas" element={<Reservations />} />
          <Route path="/seguimiento" element={<Tracking />} />
          <Route path="/contacto" element={<Contact />} />
        </Route>

        <Route path="/login" element={<Login />} />

        <Route
          path="/sin-permiso"
          element={<Unauthorized />}
        />

        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route
              index
              element={
                <Navigate to="dashboard" replace />
              }
            />

            <Route
              path="dashboard"
              element={<Dashboard />}
            />
          </Route>
        </Route>

        <Route
          element={
            <ProtectedRoute
              rolesPermitidos={[
                "ADMINISTRADOR",
                "VENDEDOR",
              ]}
            />
          }
        >
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="clientes" element={<Clients />} />
            <Route path="ventas" element={<Sales />} />
          </Route>
        </Route>

        <Route
          element={
            <ProtectedRoute
              rolesPermitidos={[
                "ADMINISTRADOR",
                "TECNICO",
              ]}
            />
          }
        >
          <Route path="/admin" element={<AdminLayout />}>
            <Route
              path="equipos"
              element={<Equipment />}
            />
            <Route
              path="reparaciones"
              element={<Repairs />}
            />
          </Route>
        </Route>

        <Route
          element={
            <ProtectedRoute
              rolesPermitidos={[
                "ADMINISTRADOR",
                "TECNICO",
                "VENDEDOR",
              ]}
            />
          }
        >
          <Route path="/admin" element={<AdminLayout />}>
            <Route
              path="inventario"
              element={<Inventory />}
            />
            <Route
              path="reservas"
              element={<ReservationsAdmin />}
            />
          </Route>
        </Route>

        <Route
          element={
            <ProtectedRoute
              rolesPermitidos={["ADMINISTRADOR"]}
            />
          }
        >
          <Route path="/admin" element={<AdminLayout />}>
            <Route
              path="reportes"
              element={<Reports />}
            />
            <Route
              path="auditoria"
              element={<Audit />}
            />
            <Route
              path="configuracion"
              element={<Settings />}
            />
          </Route>
        </Route>

        {/* Siempre debe ir dentro de Routes y al final */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;