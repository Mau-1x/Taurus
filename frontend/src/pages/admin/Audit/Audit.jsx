import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ShieldCheck,
  LoaderCircle,
  RotateCcw,
  Eye,
  X,
} from "lucide-react";

import {
  obtenerAuditoria,
} from "../../../services/auditoriaService";

import {
  obtenerUsuarios,
} from "../../../services/usuarioService";

function Audit() {
  const [registros, setRegistros] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  const [busqueda, setBusqueda] = useState("");
  const [modulo, setModulo] = useState("");
  const [accion, setAccion] = useState("");
  const [idUsuario, setIdUsuario] = useState("");

  const [registroDetalle, setRegistroDetalle] =
    useState(null);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos(filtros = {}) {
    try {
      setCargando(true);
      setError("");

      const [datosAuditoria, datosUsuarios] =
        await Promise.all([
          obtenerAuditoria(filtros),
          obtenerUsuarios(),
        ]);

      setRegistros(datosAuditoria);
      setUsuarios(datosUsuarios);
    } catch (errorCarga) {
      setError(errorCarga.message);
    } finally {
      setCargando(false);
    }
  }

  async function aplicarFiltros(evento) {
    evento.preventDefault();

    await cargarDatos({
      modulo,
      accion,
      idUsuario,
    });
  }

  async function limpiarFiltros() {
    setBusqueda("");
    setModulo("");
    setAccion("");
    setIdUsuario("");

    await cargarDatos();
  }

  const registrosFiltrados = useMemo(() => {
    const texto = busqueda
      .trim()
      .toLowerCase();

    if (!texto) return registros;

    return registros.filter((registro) => {
      return (
        registro.USUARIO
          ?.toLowerCase()
          .includes(texto) ||
        registro.MODULO
          ?.toLowerCase()
          .includes(texto) ||
        registro.ACCION
          ?.toLowerCase()
          .includes(texto) ||
        registro.DESCRIPCION
          ?.toLowerCase()
          .includes(texto) ||
        registro.IP
          ?.toLowerCase()
          .includes(texto)
      );
    });
  }, [registros, busqueda]);

  return (
    <section>
      <div>
        <p className="text-sm text-gray-500">
          Seguridad y control
        </p>

        <h1 className="mt-1 text-3xl font-bold text-gray-900">
          Auditoría
        </h1>

        <p className="mt-2 text-gray-600">
          Revisa las acciones realizadas dentro del sistema.
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={aplicarFiltros}
        className="mt-8 grid gap-4 rounded-2xl bg-white p-6 shadow-sm md:grid-cols-2 xl:grid-cols-5"
      >
        <label>
          <span className="mb-2 block text-sm font-semibold text-gray-700">
            Módulo
          </span>

          <select
            value={modulo}
            onChange={(evento) =>
              setModulo(evento.target.value)
            }
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
          >
            <option value="">Todos</option>
            <option value="AUTENTICACION">
              Autenticación
            </option>
            <option value="REPARACIONES">
              Reparaciones
            </option>
            <option value="EQUIPOS">
              Equipos
            </option>
            <option value="CLIENTES">
              Clientes
            </option>
            <option value="INVENTARIO">
              Inventario
            </option>
            <option value="VENTAS">
              Ventas
            </option>
            <option value="USUARIOS">
              Usuarios
            </option>
          </select>
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold text-gray-700">
            Acción
          </span>

          <select
            value={accion}
            onChange={(evento) =>
              setAccion(evento.target.value)
            }
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
          >
            <option value="">Todas</option>
            <option value="CREAR">Crear</option>
            <option value="EDITAR">Editar</option>
            <option value="ELIMINAR">
              Eliminar
            </option>
            <option value="CAMBIAR_ESTADO">
              Cambiar estado
            </option>
            <option value="REGISTRAR_PAGO">
              Registrar pago
            </option>
            <option value="ANULAR_PAGO">
              Anular pago
            </option>
            <option value="AGREGAR_REPUESTO">
              Agregar repuesto
            </option>
            <option value="QUITAR_REPUESTO">
              Quitar repuesto
            </option>
            <option value="SUBIR_FOTO">
              Subir foto
            </option>
            <option value="ELIMINAR_FOTO">
              Eliminar foto
            </option>
            <option value="INICIAR_SESION">
              Iniciar sesión
            </option>
          </select>
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold text-gray-700">
            Usuario
          </span>

          <select
            value={idUsuario}
            onChange={(evento) =>
              setIdUsuario(evento.target.value)
            }
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
          >
            <option value="">
              Todos los usuarios
            </option>

            {usuarios.map((usuario) => (
              <option
                key={usuario.IDUSUARIO}
                value={usuario.IDUSUARIO}
              >
                {usuario.NOMBRE}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end">
          <button
            type="submit"
            className="w-full rounded-xl bg-red-700 px-5 py-3 font-semibold text-white hover:bg-red-800"
          >
            Aplicar filtros
          </button>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={limpiarFiltros}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
          >
            <RotateCcw size={18} />
            Limpiar
          </button>
        </div>
      </form>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={busqueda}
              onChange={(evento) =>
                setBusqueda(evento.target.value)
              }
              placeholder="Buscar usuario, acción, descripción o IP"
              className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 outline-none focus:border-red-600"
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <ShieldCheck size={19} />
            {registrosFiltrados.length} registros
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
            <table className="w-full min-w-[1200px]">
              <thead>
                <tr className="border-b text-left text-sm text-gray-500">
                  <th className="pb-4">Fecha</th>
                  <th className="pb-4">Usuario</th>
                  <th className="pb-4">Módulo</th>
                  <th className="pb-4">Acción</th>
                  <th className="pb-4">Descripción</th>
                  <th className="pb-4">IP</th>
                  <th className="pb-4 text-right">
                    Detalle
                  </th>
                </tr>
              </thead>

              <tbody>
                {registrosFiltrados.map(
                  (registro) => (
                    <tr
                      key={registro.IDAUDITORIA}
                      className="border-b border-gray-100"
                    >
                      <td className="py-4">
                        {formatearFechaHora(
                          registro.FECHA
                        )}
                      </td>

                      <td className="py-4 font-semibold">
                        {registro.USUARIO}
                      </td>

                      <td className="py-4">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                          {registro.MODULO}
                        </span>
                      </td>

                      <td className="py-4">
                        <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-700">
                          {formatearAccion(
                            registro.ACCION
                          )}
                        </span>
                      </td>

                      <td className="max-w-[360px] py-4">
                        <p className="truncate">
                          {registro.DESCRIPCION ||
                            "Sin descripción"}
                        </p>
                      </td>

                      <td className="py-4">
                        {registro.IP || "Sin IP"}
                      </td>

                      <td className="py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setRegistroDetalle(
                              registro
                            )
                          }
                          title="Ver detalle"
                          className="rounded-lg bg-gray-100 p-2 text-gray-700 hover:bg-gray-200"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  )
                )}

                {registrosFiltrados.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="py-16 text-center text-gray-500"
                    >
                      No se encontraron registros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {registroDetalle && (
        <ModalDetalle
          registro={registroDetalle}
          cerrar={() =>
            setRegistroDetalle(null)
          }
        />
      )}
    </section>
  );
}

function ModalDetalle({ registro, cerrar }) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white">
        <div className="flex items-center justify-between border-b px-7 py-5">
          <div>
            <h2 className="text-2xl font-bold">
              Detalle de auditoría
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Registro #{registro.IDAUDITORIA}
            </p>
          </div>

          <button
            type="button"
            onClick={cerrar}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-5 p-7">
          <Detalle
            titulo="Fecha"
            valor={formatearFechaHora(
              registro.FECHA
            )}
          />

          <Detalle
            titulo="Usuario"
            valor={registro.USUARIO}
          />

          <Detalle
            titulo="Módulo"
            valor={registro.MODULO}
          />

          <Detalle
            titulo="Acción"
            valor={formatearAccion(
              registro.ACCION
            )}
          />

          <Detalle
            titulo="Entidad"
            valor={`${registro.ENTIDAD}${
              registro.IDENTIDAD
                ? ` #${registro.IDENTIDAD}`
                : ""
            }`}
          />

          <Detalle
            titulo="Descripción"
            valor={
              registro.DESCRIPCION ||
              "Sin descripción"
            }
          />

          <Detalle
            titulo="Dirección IP"
            valor={registro.IP || "Sin IP"}
          />

          <BloqueJson
            titulo="Datos anteriores"
            contenido={registro.DATOS_ANTERIORES}
          />

          <BloqueJson
            titulo="Datos nuevos"
            contenido={registro.DATOS_NUEVOS}
          />
        </div>
      </div>
    </div>
  );
}

function Detalle({ titulo, valor }) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-500">
        {titulo}
      </p>

      <p className="mt-1 text-gray-900">
        {valor}
      </p>
    </div>
  );
}

function BloqueJson({ titulo, contenido }) {
  let texto = "Sin información";

  if (contenido) {
    try {
      texto = JSON.stringify(
        JSON.parse(contenido),
        null,
        2
      );
    } catch {
      texto = contenido;
    }
  }

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-gray-500">
        {titulo}
      </p>

      <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl bg-gray-950 p-4 text-sm text-gray-100">
        {texto}
      </pre>
    </div>
  );
}

function formatearFechaHora(fecha) {
  if (!fecha) return "Sin fecha";

  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(fecha));
}

function formatearAccion(accion) {
  return String(accion || "")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letra) =>
      letra.toUpperCase()
    );
}

export default Audit;