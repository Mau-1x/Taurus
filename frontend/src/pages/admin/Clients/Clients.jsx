import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  LoaderCircle,
  Users,
} from "lucide-react";

import {
  obtenerClientes,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
} from "../../../services/clienteService";

const formularioInicial = {
  dni: "",
  nombres: "",
  apellidoPaterno: "",
  apellidoMaterno: "",
  celular: "",
  email: "",
  direccion: "",
};

function Clients() {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    cargarClientes();
  }, []);

  async function cargarClientes() {
    try {
      setCargando(true);
      setError("");

      const datos = await obtenerClientes();
      setClientes(datos);
    } catch (errorCarga) {
      setError(errorCarga.message);
    } finally {
      setCargando(false);
    }
  }

  const clientesFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    if (!texto) return clientes;

    return clientes.filter((cliente) => {
      const nombreCompleto = `
        ${cliente.NOMBRES}
        ${cliente.APELLIDO_PATERNO}
        ${cliente.APELLIDO_MATERNO || ""}
      `.toLowerCase();

      return (
        nombreCompleto.includes(texto) ||
        cliente.DNI?.includes(texto) ||
        cliente.CELULAR?.includes(texto) ||
        cliente.EMAIL?.toLowerCase().includes(texto)
      );
    });
  }, [clientes, busqueda]);

  function abrirNuevoCliente() {
    setClienteEditando(null);
    setFormulario(formularioInicial);
    setError("");
    setMensaje("");
    setModalAbierto(true);
  }

  function abrirEditarCliente(cliente) {
    setClienteEditando(cliente);

    setFormulario({
      dni: cliente.DNI || "",
      nombres: cliente.NOMBRES || "",
      apellidoPaterno: cliente.APELLIDO_PATERNO || "",
      apellidoMaterno: cliente.APELLIDO_MATERNO || "",
      celular: cliente.CELULAR || "",
      email: cliente.EMAIL || "",
      direccion: cliente.DIRECCION || "",
    });

    setError("");
    setMensaje("");
    setModalAbierto(true);
  }

  function manejarCambio(evento) {
    const { name } = evento.target;
    let { value } = evento.target;

    if (name === "dni") {
      value = value.replace(/\D/g, "").slice(0, 8);
    }

    if (name === "celular") {
      value = value.replace(/\D/g, "").slice(0, 9);
    }

    if (
      name === "nombres" ||
      name === "apellidoPaterno" ||
      name === "apellidoMaterno"
    ) {
      value = value
        .replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñüÜ\s-]/g, "")
        .slice(0, 100);
    }

    if (name === "email") {
      value = value.slice(0, 100);
    }

    if (name === "direccion") {
      value = value.slice(0, 200);
    }

    setFormulario((estadoAnterior) => ({
      ...estadoAnterior,
      [name]: value,
    }));
  }

  async function manejarGuardar(evento) {
    evento.preventDefault();

    try {
      setGuardando(true);
      setError("");
      setMensaje("");

      if (!/^\d{8}$/.test(formulario.dni)) {
        throw new Error(
          "El DNI debe contener exactamente 8 números"
        );
      }

      if (!/^\d{9}$/.test(formulario.celular)) {
        throw new Error(
          "El celular debe contener exactamente 9 números"
        );
      }

      const expresionNombre =
        /^[a-zA-ZÁÉÍÓÚáéíóúÑñüÜ\s-]{2,100}$/;

      if (!expresionNombre.test(formulario.nombres.trim())) {
        throw new Error(
          "Los nombres deben contener solo letras y tener mínimo 2 caracteres"
        );
      }

      if (
        !expresionNombre.test(
          formulario.apellidoPaterno.trim()
        )
      ) {
        throw new Error(
          "El apellido paterno debe contener solo letras"
        );
      }

      if (
        formulario.apellidoMaterno &&
        !expresionNombre.test(
          formulario.apellidoMaterno.trim()
        )
      ) {
        throw new Error(
          "El apellido materno debe contener solo letras"
        );
      }

      if (
        formulario.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          formulario.email
        )
      ) {
        throw new Error("El correo electrónico no es válido");
      }

      if (formulario.direccion.length > 200) {
        throw new Error(
          "La dirección no puede superar los 200 caracteres"
        );
      }

      if (clienteEditando) {
        await actualizarCliente(
          clienteEditando.IDCLIENTE,
          formulario
        );

        setMensaje("Cliente actualizado correctamente");
      } else {
        await crearCliente(formulario);
        setMensaje("Cliente registrado correctamente");
      }

      await cargarClientes();

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

  async function manejarEliminar(cliente) {
    const confirmar = window.confirm(
      `¿Deseas eliminar a ${cliente.NOMBRES} ${cliente.APELLIDO_PATERNO}?`
    );

    if (!confirmar) return;

    try {
      setError("");
      await eliminarCliente(cliente.IDCLIENTE);
      await cargarClientes();
    } catch (errorEliminacion) {
      setError(errorEliminacion.message);
    }
  }

  return (
    <section>
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-gray-500">
            Gestión administrativa
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Clientes
          </h1>

          <p className="mt-2 text-gray-600">
            Registra y administra los clientes de Taurus.
          </p>
        </div>

        <button
          onClick={abrirNuevoCliente}
          className="flex items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-3 font-semibold text-white transition hover:bg-red-800"
        >
          <Plus size={20} />
          Nuevo cliente
        </button>
      </div>

      {error && !modalAbierto && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              placeholder="Buscar por DNI, nombre, celular o correo"
              className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 outline-none transition focus:border-red-600"
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users size={19} />
            {clientesFiltrados.length} clientes
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
            <table className="w-full min-w-[950px]">
              <thead>
                <tr className="border-b text-left text-sm text-gray-500">
                  <th className="pb-4">ID</th>
                  <th className="pb-4">DNI</th>
                  <th className="pb-4">Cliente</th>
                  <th className="pb-4">Celular</th>
                  <th className="pb-4">Correo</th>
                  <th className="pb-4">Dirección</th>
                  <th className="pb-4 text-right">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {clientesFiltrados.map((cliente) => (
                  <tr
                    key={cliente.IDCLIENTE}
                    className="border-b border-gray-100"
                  >
                    <td className="py-4 font-semibold">
                      {cliente.IDCLIENTE}
                    </td>

                    <td className="py-4">
                      {cliente.DNI}
                    </td>

                    <td className="py-4">
                      <p className="font-semibold text-gray-900">
                        {cliente.NOMBRES}{" "}
                        {cliente.APELLIDO_PATERNO}{" "}
                        {cliente.APELLIDO_MATERNO}
                      </p>
                    </td>

                    <td className="py-4">
                      {cliente.CELULAR}
                    </td>

                    <td className="py-4">
                      {cliente.EMAIL || "Sin correo"}
                    </td>

                    <td className="py-4">
                      {cliente.DIRECCION || "Sin dirección"}
                    </td>

                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => abrirEditarCliente(cliente)}
                          title="Editar"
                          className="rounded-lg bg-blue-50 p-2 text-blue-700 transition hover:bg-blue-100"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          onClick={() => manejarEliminar(cliente)}
                          title="Eliminar"
                          className="rounded-lg bg-red-50 p-2 text-red-700 transition hover:bg-red-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {clientesFiltrados.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="py-16 text-center text-gray-500"
                    >
                      No se encontraron clientes.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalAbierto && (
        <ModalCliente
          formulario={formulario}
          clienteEditando={clienteEditando}
          guardando={guardando}
          mensaje={mensaje}
          error={error}
          manejarCambio={manejarCambio}
          manejarGuardar={manejarGuardar}
          cerrar={() => setModalAbierto(false)}
        />
      )}
    </section>
  );
}

function ModalCliente({
  formulario,
  clienteEditando,
  guardando,
  mensaje,
  error,
  manejarCambio,
  manejarGuardar,
  cerrar,
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-7 py-5">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {clienteEditando
                ? "Editar cliente"
                : "Registrar cliente"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Completa la información solicitada.
            </p>
          </div>

          <button
            onClick={cerrar}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        <form
          onSubmit={manejarGuardar}
          className="grid gap-5 p-7 md:grid-cols-2"
        >
          <Campo
            label="DNI"
            name="dni"
            value={formulario.dni}
            onChange={manejarCambio}
            maxLength={8}
            inputMode="numeric"
            placeholder="8 dígitos"
            required
          />

          <Campo
            label="Nombres"
            name="nombres"
            value={formulario.nombres}
            onChange={manejarCambio}
            maxLength={20}
            placeholder="Ejemplo: Patricio Roberto"
            required
          />

          <Campo
            label="Apellido paterno"
            name="apellidoPaterno"
            value={formulario.apellidoPaterno}
            onChange={manejarCambio}
            maxLength={20}
            required
          />

          <Campo
            label="Apellido materno"
            name="apellidoMaterno"
            value={formulario.apellidoMaterno}
            onChange={manejarCambio}
            maxLength={20}
          />

          <Campo
            label="Celular"
            name="celular"
            value={formulario.celular}
            onChange={manejarCambio}
            maxLength={9}
            inputMode="numeric"
            placeholder="9 dígitos"
            required
          />

          <Campo
            label="Correo"
            name="email"
            type="email"
            value={formulario.email}
            onChange={manejarCambio}
            maxLength={100}
            placeholder="ejemplo@correo.com"
          />

          <Campo
            label="Dirección"
            name="direccion"
            value={formulario.direccion}
            onChange={manejarCambio}
            maxLength={200}
            placeholder="Máximo 200 caracteres"
          />

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
              onClick={cerrar}
              className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={guardando}
              className="flex items-center gap-2 rounded-xl bg-red-700 px-6 py-3 font-semibold text-white transition hover:bg-red-800 disabled:opacity-60"
            >
              {guardando && (
                <LoaderCircle
                  size={19}
                  className="animate-spin"
                />
              )}

              {guardando
                ? "Guardando..."
                : clienteEditando
                  ? "Guardar cambios"
                  : "Registrar cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Campo({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  maxLength,
  inputMode,
  placeholder,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
        {required && (
          <span className="text-red-600"> *</span>
        )}
      </span>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        maxLength={maxLength}
        inputMode={inputMode}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-red-600"
      />

      {maxLength && (
        <p className="mt-1 text-right text-xs text-gray-500">
          {value.length}/{maxLength}
        </p>
      )}
    </label>
  );
}

export default Clients;