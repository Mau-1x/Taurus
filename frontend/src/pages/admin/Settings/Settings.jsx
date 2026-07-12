import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  UserCheck,
  UserX,
  Users,
  ShieldCheck,
  X,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

import {
  obtenerUsuarios,
  obtenerRoles,
  crearUsuario,
  actualizarUsuario,
  cambiarEstadoUsuario,
} from "../../../services/usuarioService";

import { obtenerUsuario } from "../../../services/authService";

const formularioInicial = {
  idRol: "",
  nombre: "",
  correo: "",
  password: "",
};

function Settings() {
  const usuarioActual = obtenerUsuario();

  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);

  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [formulario, setFormulario] = useState(formularioInicial);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      setCargando(true);
      setError("");

      const [datosUsuarios, datosRoles] = await Promise.all([
        obtenerUsuarios(),
        obtenerRoles(),
      ]);

      setUsuarios(datosUsuarios);
      setRoles(datosRoles);
    } catch (errorCarga) {
      setError(errorCarga.message);
    } finally {
      setCargando(false);
    }
  }

  const usuariosFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    return usuarios.filter((usuario) => {
      const coincideTexto =
        !texto ||
        usuario.NOMBRE?.toLowerCase().includes(texto) ||
        usuario.CORREO?.toLowerCase().includes(texto) ||
        usuario.ROL?.toLowerCase().includes(texto);

      const coincideRol =
        !filtroRol ||
        String(usuario.IDROL) === String(filtroRol);

      return coincideTexto && coincideRol;
    });
  }, [usuarios, busqueda, filtroRol]);

  const resumen = useMemo(() => {
    return {
      total: usuarios.length,
      activos: usuarios.filter((usuario) => usuario.ESTADO).length,
      inactivos: usuarios.filter((usuario) => !usuario.ESTADO).length,
      administradores: usuarios.filter(
        (usuario) => usuario.ROL === "ADMINISTRADOR"
      ).length,
    };
  }, [usuarios]);

  function abrirNuevoUsuario() {
    setUsuarioEditando(null);
    setFormulario(formularioInicial);
    setError("");
    setMensaje("");
    setModalAbierto(true);
  }

  function abrirEditarUsuario(usuario) {
    setUsuarioEditando(usuario);

    setFormulario({
      idRol: usuario.IDROL || "",
      nombre: usuario.NOMBRE || "",
      correo: usuario.CORREO || "",
      password: "",
    });

    setError("");
    setMensaje("");
    setModalAbierto(true);
  }

  function manejarCambio(evento) {
    const { name } = evento.target;
    let { value } = evento.target;

    if (name === "nombre") {
      value = value
        .replace(
          /[^a-zA-ZÁÉÍÓÚáéíóúÑñüÜ\s-]/g,
          ""
        )
        .slice(0, 120);
    }

    if (name === "correo") {
      value = value
        .toLowerCase()
        .slice(0, 150);
    }

    if (name === "password") {
      value = value.slice(0, 72);
    }

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  async function manejarGuardar(evento) {
    evento.preventDefault();

    try {
      setGuardando(true);
      setError("");
      setMensaje("");

      if (!formulario.idRol) {
      throw new Error("Selecciona un rol");
    }

    if (
      !/^[a-zA-ZÁÉÍÓÚáéíóúÑñüÜ\s-]{3,120}$/.test(
        formulario.nombre.trim()
      )
    ) {
      throw new Error(
        "El nombre debe contener solo letras y tener mínimo 3 caracteres"
      );
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(
        formulario.correo.trim()
      )
    ) {
      throw new Error(
        "El correo electrónico no es válido"
      );
    }

    if (formulario.password) {
      if (formulario.password.length < 8) {
        throw new Error(
          "La contraseña debe tener al menos 8 caracteres"
        );
      }

      if (
        !/[A-Z]/.test(formulario.password) ||
        !/[a-z]/.test(formulario.password) ||
        !/\d/.test(formulario.password)
      ) {
        throw new Error(
          "La contraseña debe incluir mayúscula, minúscula y número"
        );
      }
    }

      const datos = {
        idRol: Number(formulario.idRol),
        nombre: formulario.nombre.trim(),
        correo: formulario.correo.trim().toLowerCase(),
      };

      if (formulario.password) {
        datos.password = formulario.password;
      }

      if (usuarioEditando) {
        await actualizarUsuario(
          usuarioEditando.IDUSUARIO,
          datos
        );

        setMensaje("Usuario actualizado correctamente");
      } else {
        if (!formulario.password) {
          throw new Error(
            "La contraseña es obligatoria para un usuario nuevo"
          );
        }

        await crearUsuario({
          ...datos,
          password: formulario.password,
        });

        setMensaje("Usuario creado correctamente");
      }

      await cargarDatos();

      setTimeout(() => {
        setModalAbierto(false);
        setMensaje("");
      }, 700);
    } catch (errorGuardado) {
      setError(errorGuardado.message);
    } finally {
      setGuardando(false);
    }
  }

  async function manejarCambioEstado(usuario) {
    const nuevoEstado = !usuario.ESTADO;

    const accion = nuevoEstado ? "activar" : "desactivar";

    const confirmar = window.confirm(
      `¿Deseas ${accion} al usuario ${usuario.NOMBRE}?`
    );

    if (!confirmar) return;

    try {
      setError("");

      await cambiarEstadoUsuario(
        usuario.IDUSUARIO,
        nuevoEstado
      );

      await cargarDatos();
    } catch (errorEstado) {
      setError(errorEstado.message);
    }
  }

  return (
    <section>
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-gray-500">
            Administración del sistema
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Configuración
          </h1>

          <p className="mt-2 text-gray-600">
            Administra usuarios, roles y accesos al sistema.
          </p>
        </div>

        <button
          onClick={abrirNuevoUsuario}
          className="flex items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-3 font-semibold text-white transition hover:bg-red-800"
        >
          <Plus size={20} />
          Nuevo usuario
        </button>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Tarjeta
          titulo="Usuarios"
          valor={resumen.total}
          icono={Users}
          clase="bg-blue-100 text-blue-700"
        />

        <Tarjeta
          titulo="Activos"
          valor={resumen.activos}
          icono={UserCheck}
          clase="bg-green-100 text-green-700"
        />

        <Tarjeta
          titulo="Inactivos"
          valor={resumen.inactivos}
          icono={UserX}
          clase="bg-red-100 text-red-700"
        />

        <Tarjeta
          titulo="Administradores"
          valor={resumen.administradores}
          icono={ShieldCheck}
          clase="bg-purple-100 text-purple-700"
        />
      </div>

      {error && !modalAbierto && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle size={22} />
          <p>{error}</p>
        </div>
      )}

      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={busqueda}
              onChange={(evento) =>
                setBusqueda(evento.target.value)
              }
              placeholder="Buscar nombre, correo o rol"
              className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 outline-none focus:border-red-600"
            />
          </div>

          <select
            value={filtroRol}
            onChange={(evento) =>
              setFiltroRol(evento.target.value)
            }
            className="rounded-xl border border-gray-300 px-4 py-3"
          >
            <option value="">Todos los roles</option>

            {roles.map((rol) => (
              <option
                key={rol.IDROL}
                value={rol.IDROL}
              >
                {rol.NOMBRE}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users size={19} />
            {usuariosFiltrados.length} usuarios
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          {cargando ? (
            <div className="flex justify-center py-16">
              <LoaderCircle
                size={38}
                className="animate-spin text-red-700"
              />
            </div>
          ) : (
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b text-left text-sm text-gray-500">
                  <th className="pb-4">Usuario</th>
                  <th className="pb-4">Correo</th>
                  <th className="pb-4">Rol</th>
                  <th className="pb-4">Registro</th>
                  <th className="pb-4">Último acceso</th>
                  <th className="pb-4">Estado</th>
                  <th className="pb-4 text-right">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {usuariosFiltrados.map((usuario) => (
                  <tr
                    key={usuario.IDUSUARIO}
                    className="border-b border-gray-100"
                  >
                    <td className="py-4">
                      <p className="font-semibold text-gray-900">
                        {usuario.NOMBRE}
                      </p>

                      {usuario.IDUSUARIO ===
                        usuarioActual?.idUsuario && (
                        <p className="text-xs font-semibold text-red-700">
                          Tu cuenta
                        </p>
                      )}
                    </td>

                    <td className="py-4">
                      {usuario.CORREO}
                    </td>

                    <td className="py-4">
                      <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-700">
                        {usuario.ROL}
                      </span>
                    </td>

                    <td className="py-4">
                      {formatearFecha(usuario.FECHA_REGISTRO)}
                    </td>

                    <td className="py-4">
                      {usuario.ULTIMO_ACCESO
                        ? formatearFechaHora(
                            usuario.ULTIMO_ACCESO
                          )
                        : "Nunca"}
                    </td>

                    <td className="py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-semibold ${
                          usuario.ESTADO
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {usuario.ESTADO
                          ? "ACTIVO"
                          : "INACTIVO"}
                      </span>
                    </td>

                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            abrirEditarUsuario(usuario)
                          }
                          title="Editar usuario"
                          className="rounded-lg bg-blue-50 p-2 text-blue-700 transition hover:bg-blue-100"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          onClick={() =>
                            manejarCambioEstado(usuario)
                          }
                          disabled={
                            usuario.IDUSUARIO ===
                              usuarioActual?.idUsuario &&
                            usuario.ESTADO
                          }
                          title={
                            usuario.ESTADO
                              ? "Desactivar usuario"
                              : "Activar usuario"
                          }
                          className={`rounded-lg p-2 transition ${
                            usuario.ESTADO
                              ? "bg-red-50 text-red-700 hover:bg-red-100"
                              : "bg-green-50 text-green-700 hover:bg-green-100"
                          } disabled:cursor-not-allowed disabled:opacity-40`}
                        >
                          {usuario.ESTADO ? (
                            <UserX size={18} />
                          ) : (
                            <UserCheck size={18} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {usuariosFiltrados.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="py-16 text-center text-gray-500"
                    >
                      No se encontraron usuarios.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-7 py-5">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {usuarioEditando
                    ? "Editar usuario"
                    : "Nuevo usuario"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Configura los datos y el nivel de acceso.
                </p>
              </div>

              <button
                onClick={() => setModalAbierto(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>

            <form
              onSubmit={manejarGuardar}
              className="grid gap-5 p-7 md:grid-cols-2"
            >
              <label>
                <span className="mb-2 block text-sm font-semibold text-gray-700">
                  Nombre completo *
                </span>

                <input
                  name="nombre"
                  value={formulario.nombre}
                  onChange={manejarCambio}
                  maxLength={120}
                  autoComplete="name"
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600"
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-semibold text-gray-700">
                  Rol *
                </span>

                <select
                  name="idRol"
                  value={formulario.idRol}
                  onChange={manejarCambio}
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600"
                >
                  <option value="">Seleccionar rol</option>

                  {roles.map((rol) => (
                    <option
                      key={rol.IDROL}
                      value={rol.IDROL}
                    >
                      {rol.NOMBRE}
                    </option>
                  ))}
                </select>
              </label>

              <label className="md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-gray-700">
                  Correo electrónico *
                </span>

                <input
                  type="email"
                  name="correo"
                  value={formulario.correo}
                  onChange={manejarCambio}
                  maxLength={150}
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600"
                />
              </label>

              <label className="md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-gray-700">
                  Contraseña
                  {!usuarioEditando && (
                    <span className="text-red-600"> *</span>
                  )}
                </span>

                <input
                  type="password"
                  name="password"
                  value={formulario.password}
                  onChange={manejarCambio}
                  minLength={usuarioEditando ? undefined : 8}
                  maxLength={72}
                  autoComplete="new-password"
                  required={!usuarioEditando}
                  placeholder={
                    usuarioEditando
                      ? "Déjala vacía para mantener la actual"
                      : "Mínimo 8 caracteres"
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600"
                />
              </label>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 md:col-span-2">
                  {error}
                </div>
              )}

              {mensaje && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-700 md:col-span-2">
                  {mensaje}
                </div>
              )}

              <div className="flex justify-end gap-3 border-t pt-5 md:col-span-2">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={guardando}
                  className="flex items-center gap-2 rounded-xl bg-red-700 px-6 py-3 font-semibold text-white hover:bg-red-800 disabled:opacity-60"
                >
                  {guardando && (
                    <LoaderCircle
                      size={19}
                      className="animate-spin"
                    />
                  )}

                  {guardando
                    ? "Guardando..."
                    : usuarioEditando
                      ? "Guardar cambios"
                      : "Crear usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

function Tarjeta({
  titulo,
  valor,
  icono: Icono,
  clase,
}) {
  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm">
      <div className={`inline-flex rounded-xl p-3 ${clase}`}>
        <Icono size={23} />
      </div>

      <p className="mt-4 text-sm text-gray-500">
        {titulo}
      </p>

      <p className="mt-1 text-3xl font-bold text-gray-900">
        {valor}
      </p>
    </article>
  );
}

function formatearFecha(fecha) {
  if (!fecha) return "Sin fecha";

  return new Intl.DateTimeFormat("es-PE").format(
    new Date(fecha)
  );
}

function formatearFechaHora(fecha) {
  if (!fecha) return "Nunca";

  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(fecha));
}

export default Settings;