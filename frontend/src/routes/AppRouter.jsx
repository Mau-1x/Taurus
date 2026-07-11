import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout";
import AdminLayout from "../layouts/AdminLayout";

import Home from "../pages/Home/Home";
import Products from "../pages/Products/Products";
import Tracking from "../pages/Tracking/Tracking";
import Reservations from "../pages/Reservations/Reservations";
import Login from "../pages/Login/Login";
import ProtectedRoute from "./ProtectedRoute";

import Dashboard from "../pages/admin/Dashboard/Dashboard";
import Clients from "../pages/admin/Clients/Clients";
import Equipment from "../pages/admin/Equipment/Equipment";
import Repairs from "../pages/admin/Repairs/Repairs";
import Inventory from "../pages/admin/Inventory/Inventory";
import Sales from "../pages/admin/Sales/Sales";
import ReservationsAdmin from "../pages/admin/ReservationsAdmin/ReservationsAdmin";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Products />} />
          <Route path="/reservas" element={<Reservations />} />
          <Route path="/seguimiento" element={<Tracking />} />
        </Route>

        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route
              index
              element={<Navigate to="dashboard" replace />}
            />

            <Route path="dashboard" element={<Dashboard />} />
            <Route path="clientes" element={<Clients />} />
            <Route path="equipos" element={<Equipment />} />
            <Route path="reparaciones" element={<Repairs />} />
            <Route path="inventario" element={<Inventory />} />
            <Route path="ventas" element={<Sales />} />
            <Route
              path="reservas"
              element={<ReservationsAdmin />}
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;