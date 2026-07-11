import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout";
import AdminLayout from "../layouts/AdminLayout";

import Home from "../pages/Home/Home";
import Products from "../pages/Products/Products";
import Tracking from "../pages/Tracking/Tracking";

import Dashboard from "../pages/admin/Dashboard/Dashboard";
import Clients from "../pages/admin/Clients/Clients";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Páginas públicas */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Products />} />
          <Route path="/seguimiento" element={<Tracking />} />
        </Route>

        {/* Panel administrativo */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="clientes" element={<Clients />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;