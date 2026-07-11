import { Navigate, Outlet } from "react-router-dom";
import {
  estaAutenticado,
  obtenerUsuario,
} from "../services/authService";

function ProtectedRoute({ rolesPermitidos = [] }) {
  const usuario = obtenerUsuario();

  if (!estaAutenticado() || !usuario) {
    return <Navigate to="/login" replace />;
  }

  if (
    rolesPermitidos.length > 0 &&
    !rolesPermitidos.includes(usuario.rol)
  ) {
    return <Navigate to="/sin-permiso" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;