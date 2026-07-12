import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  ShoppingCart,
  Eye,
  Ban,
  X,
  Trash2,
  LoaderCircle,
} from "lucide-react";

import { obtenerClientes } from "../../../services/clienteService";
import { obtenerProductos } from "../../../services/productoService";

import {
  obtenerVentas,
  obtenerVentaPorId,
  crearVenta,
  anularVenta,
} from "../../../services/ventaService";

function Sales() {
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);

  const [busqueda, setBusqueda] = useState("");
  const [modalVenta, setModalVenta] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);

  const [detalleVenta, setDetalleVenta] = useState(null);

  const [formulario, setFormulario] = useState({
    idCliente: "",
    metodoPago: "EFECTIVO",
    descuento: 0,
    observaciones: "",
  });

  const [items, setItems] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] =
    useState("");
  const [cantidad, setCantidad] = useState(1);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      setCargando(true);
      setError("");

      const [datosVentas, datosClientes, datosProductos] =
        await Promise.all([
          obtenerVentas(),
          obtenerClientes(),
          obtenerProductos(),
        ]);

      setVentas(datosVentas);
      setClientes(datosClientes);
      setProductos(datosProductos);
    } catch (errorCarga) {
      setError(errorCarga.message);
    } finally {
      setCargando(false);
    }
  }

  const ventasFiltradas = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    if (!texto) return ventas;

    return ventas.filter((venta) => {
      return (
        venta.NUMERO_VENTA?.toLowerCase().includes(texto) ||
        venta.CLIENTE?.toLowerCase().includes(texto) ||
        venta.DNI?.includes(texto) ||
        venta.METODO_PAGO?.toLowerCase().includes(texto)
      );
    });
  }, [ventas, busqueda]);

  const subtotal = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total +
        Number(item.PRECIO_VENTA) * Number(item.cantidad),
      0
    );
  }, [items]);

  const total = Math.max(
    subtotal - Number(formulario.descuento || 0),
    0
  );

  function abrirNuevaVenta() {
    setFormulario({
      idCliente: "",
      metodoPago: "EFECTIVO",
      descuento: 0,
      observaciones: "",
    });

    setItems([]);
    setProductoSeleccionado("");
    setCantidad(1);
    setError("");
    setModalVenta(true);
  }

  function agregarProducto() {
    const producto = productos.find(
      (item) =>
        item.IDPRODUCTO === Number(productoSeleccionado)
    );

    if (!producto) {
      setError("Selecciona un producto");
      return;
    }

    const cantidadNumerica = Number(cantidad);

    if (
      !Number.isInteger(cantidadNumerica) ||
      cantidadNumerica <= 0
    ) {
      setError(
        "La cantidad debe ser un número entero mayor que cero"
      );
      return;
    }

    const existente = items.find(
      (item) => item.IDPRODUCTO === producto.IDPRODUCTO
    );

    const cantidadTotal =
      cantidadNumerica +
      Number(existente?.cantidad || 0);

    if (cantidadTotal > Number(producto.STOCK)) {
      setError("La cantidad supera el stock disponible");
      return;
    }

    if (existente) {
      setItems((anteriores) =>
        anteriores.map((item) =>
          item.IDPRODUCTO === producto.IDPRODUCTO
            ? {
                ...item,
                cantidad: cantidadTotal,
              }
            : item
        )
      );
    } else {
      setItems((anteriores) => [
        ...anteriores,
        {
          ...producto,
          cantidad: cantidadNumerica,
        },
      ]);
    }

    setProductoSeleccionado("");
    setCantidad(1);
    setError("");
  }

  async function guardarVenta(evento) {
    evento.preventDefault();

    try {
      setGuardando(true);
      setError("");

      if (items.length === 0) {
        throw new Error(
          "Debes agregar al menos un producto"
        );
      }

      const descuento = Number(
        formulario.descuento || 0
      );

      if (
        !Number.isFinite(descuento) ||
        descuento < 0
      ) {
        throw new Error(
          "El descuento no puede ser negativo"
        );
      }

      if (descuento > subtotal) {
        throw new Error(
          "El descuento no puede ser mayor al subtotal"
        );
      }

      if (
        formulario.observaciones.length > 500
      ) {
        throw new Error(
          "Las observaciones no pueden superar los 500 caracteres"
        );
      }

      for (const item of items) {
        if (
          !Number.isInteger(Number(item.cantidad)) ||
          Number(item.cantidad) <= 0
        ) {
          throw new Error(
            `La cantidad de ${item.NOMBRE} no es válida`
          );
        }

        if (
          Number(item.cantidad) >
          Number(item.STOCK)
        ) {
          throw new Error(
            `No hay suficiente stock para ${item.NOMBRE}`
          );
        }
      }

      await crearVenta({
        idCliente: formulario.idCliente
          ? Number(formulario.idCliente)
          : null,
        metodoPago: formulario.metodoPago,
        descuento: Number(formulario.descuento || 0),
        observaciones:
          formulario.observaciones || null,
        productos: items.map((item) => ({
          idProducto: item.IDPRODUCTO,
          cantidad: Number(item.cantidad),
        })),
      });

      await cargarDatos();
      setModalVenta(false);
    } catch (errorVenta) {
      setError(errorVenta.message);
    } finally {
      setGuardando(false);
    }
  }

  async function verDetalle(venta) {
    try {
      setError("");

      const datos = await obtenerVentaPorId(
        venta.IDVENTA
      );

      setDetalleVenta(datos);
      setModalDetalle(true);
    } catch (errorDetalle) {
      setError(errorDetalle.message);
    }
  }

  async function manejarAnular(venta) {
    const confirmar = window.confirm(
      `¿Deseas anular la venta ${venta.NUMERO_VENTA}? El stock será devuelto.`
    );

    if (!confirmar) return;

    try {
      setError("");
      await anularVenta(venta.IDVENTA);
      await cargarDatos();
    } catch (errorAnulacion) {
      setError(errorAnulacion.message);
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
            Ventas
          </h1>

          <p className="mt-2 text-gray-600">
            Registra ventas y controla la salida de productos.
          </p>
        </div>

        <button
          onClick={abrirNuevaVenta}
          className="flex items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-3 font-semibold text-white hover:bg-red-800"
        >
          <Plus size={20} />
          Nueva venta
        </button>
      </div>

      {error && !modalVenta && !modalDetalle && (
        <div className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">
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
              onChange={(evento) =>
                setBusqueda(evento.target.value)
              }
              placeholder="Buscar venta, cliente o método de pago"
              className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 outline-none focus:border-red-600"
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <ShoppingCart size={19} />
            {ventasFiltradas.length} ventas
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
                  <th className="pb-4">Número</th>
                  <th className="pb-4">Cliente</th>
                  <th className="pb-4">Fecha</th>
                  <th className="pb-4">Productos</th>
                  <th className="pb-4">Método</th>
                  <th className="pb-4">Total</th>
                  <th className="pb-4">Estado</th>
                  <th className="pb-4 text-right">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {ventasFiltradas.map((venta) => (
                  <tr
                    key={venta.IDVENTA}
                    className="border-b border-gray-100"
                  >
                    <td className="py-4 font-semibold">
                      {venta.NUMERO_VENTA}
                    </td>

                    <td className="py-4">
                      <p className="font-semibold">
                        {venta.CLIENTE}
                      </p>

                      {venta.DNI && (
                        <p className="text-sm text-gray-500">
                          DNI: {venta.DNI}
                        </p>
                      )}
                    </td>

                    <td className="py-4">
                      {formatearFecha(venta.FECHA)}
                    </td>

                    <td className="py-4">
                      {venta.TOTAL_PRODUCTOS || 0}
                    </td>

                    <td className="py-4">
                      {venta.METODO_PAGO}
                    </td>

                    <td className="py-4 font-bold text-red-700">
                      S/ {Number(venta.TOTAL).toFixed(2)}
                    </td>

                    <td className="py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-semibold ${
                          venta.ESTADO === "COMPLETADA"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {venta.ESTADO}
                      </span>
                    </td>

                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => verDetalle(venta)}
                          title="Ver detalle"
                          className="rounded-lg bg-blue-50 p-2 text-blue-700"
                        >
                          <Eye size={18} />
                        </button>

                        {venta.ESTADO === "COMPLETADA" && (
                          <button
                            onClick={() =>
                              manejarAnular(venta)
                            }
                            title="Anular venta"
                            className="rounded-lg bg-red-50 p-2 text-red-700"
                          >
                            <Ban size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {ventasFiltradas.length === 0 && (
                  <tr>
                    <td
                      colSpan="8"
                      className="py-16 text-center text-gray-500"
                    >
                      No se encontraron ventas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalVenta && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white">
            <div className="flex items-center justify-between border-b px-7 py-5">
              <div>
                <h2 className="text-2xl font-bold">
                  Registrar venta
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Selecciona productos y método de pago.
                </p>
              </div>

              <button onClick={() => setModalVenta(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={guardarVenta} className="p-7">
              <div className="grid gap-5 md:grid-cols-2">
                <label>
                  <span className="mb-2 block text-sm font-semibold">
                    Cliente
                  </span>

                  <select
                    value={formulario.idCliente}
                    onChange={(evento) =>
                      setFormulario((anterior) => ({
                        ...anterior,
                        idCliente: evento.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3"
                  >
                    <option value="">
                      Cliente general
                    </option>

                    {clientes.map((cliente) => (
                      <option
                        key={cliente.IDCLIENTE}
                        value={cliente.IDCLIENTE}
                      >
                        {cliente.NOMBRES}{" "}
                        {cliente.APELLIDO_PATERNO} -{" "}
                        {cliente.DNI}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="mb-2 block text-sm font-semibold">
                    Método de pago
                  </span>

                  <select
                    value={formulario.metodoPago}
                    onChange={(evento) =>
                      setFormulario((anterior) => ({
                        ...anterior,
                        metodoPago: evento.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3"
                  >
                    <option value="EFECTIVO">
                      Efectivo
                    </option>
                    <option value="YAPE">Yape</option>
                    <option value="PLIN">Plin</option>
                    <option value="TARJETA">
                      Tarjeta
                    </option>
                    <option value="TRANSFERENCIA">
                      Transferencia
                    </option>
                  </select>
                </label>
              </div>

              <div className="mt-7 rounded-2xl bg-gray-50 p-5">
                <h3 className="font-bold text-gray-900">
                  Agregar producto
                </h3>

                <div className="mt-4 grid gap-4 md:grid-cols-[1fr_150px_auto]">
                  <select
                    value={productoSeleccionado}
                    onChange={(evento) =>
                      setProductoSeleccionado(
                        evento.target.value
                      )
                    }
                    className="rounded-xl border border-gray-300 px-4 py-3"
                  >
                    <option value="">
                      Seleccionar producto
                    </option>

                    {productos
                      .filter(
                        (producto) => producto.STOCK > 0
                      )
                      .map((producto) => (
                        <option
                          key={producto.IDPRODUCTO}
                          value={producto.IDPRODUCTO}
                        >
                          {producto.NOMBRE} — S/{" "}
                          {Number(
                            producto.PRECIO_VENTA
                          ).toFixed(2)}{" "}
                          — Stock: {producto.STOCK}
                        </option>
                      ))}
                  </select>

                <input
                  type="number"
                  min="1"
                  max="99999"
                  step="1"
                  value={cantidad}
                  onChange={(evento) => {
                    const valor = evento.target.value;

                    if (
                      valor === "" ||
                      /^\d{1,6}$/.test(valor)
                    ) {
                      setCantidad(valor);
                    }
                  }}
                  className="rounded-xl border border-gray-300 px-4 py-3"
                />

                  <button
                    type="button"
                    onClick={agregarProducto}
                    className="rounded-xl bg-black px-5 py-3 font-semibold text-white"
                  >
                    Agregar
                  </button>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b text-left text-sm text-gray-500">
                      <th className="pb-4">Producto</th>
                      <th className="pb-4">Precio</th>
                      <th className="pb-4">Cantidad</th>
                      <th className="pb-4">Subtotal</th>
                      <th className="pb-4"></th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map((item) => (
                      <tr
                        key={item.IDPRODUCTO}
                        className="border-b border-gray-100"
                      >
                        <td className="py-4 font-semibold">
                          {item.NOMBRE}
                        </td>

                        <td className="py-4">
                          S/{" "}
                          {Number(
                            item.PRECIO_VENTA
                          ).toFixed(2)}
                        </td>

                        <td className="py-4">
                          {item.cantidad}
                        </td>

                        <td className="py-4 font-semibold">
                          S/{" "}
                          {(
                            Number(item.PRECIO_VENTA) *
                            Number(item.cantidad)
                          ).toFixed(2)}
                        </td>

                        <td className="py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              eliminarItem(
                                item.IDPRODUCTO
                              )
                            }
                            className="rounded-lg bg-red-50 p-2 text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-7 grid gap-5 md:grid-cols-2">
                <label>
                  <span className="mb-2 block text-sm font-semibold">
                    Observaciones
                  </span>

                  <textarea
                    value={formulario.observaciones}
                    onChange={(evento) =>
                      setFormulario((anterior) => ({
                        ...anterior,
                        observaciones:
                          evento.target.value.slice(0, 500),
                      }))
                    }
                    rows="4"
                    maxLength={500}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3"
                  />

                  <p className="mt-1 text-right text-xs text-gray-500">
                    {formulario.observaciones.length}/500
                  </p>
                </label>

                <div className="rounded-2xl bg-gray-50 p-5">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <strong>
                      S/ {subtotal.toFixed(2)}
                    </strong>
                  </div>

                  <label className="mt-4 block">
                    <span className="mb-2 block text-sm font-semibold">
                      Descuento
                    </span>

                  <input
                    type="number"
                    min="0"
                    max={subtotal}
                    step="0.01"
                    value={formulario.descuento}
                    onChange={(evento) => {
                      const valor = evento.target.value;

                      if (
                        valor === "" ||
                        /^\d{0,8}(\.\d{0,2})?$/.test(valor)
                      ) {
                        setFormulario((anterior) => ({
                          ...anterior,
                          descuento: valor,
                        }));
                      }
                    }}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3"
                  />
                  </label>

                  <div className="mt-5 flex justify-between border-t pt-4 text-xl">
                    <span className="font-bold">Total</span>
                    <strong className="text-red-700">
                      S/ {total.toFixed(2)}
                    </strong>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-5 rounded-xl bg-red-50 p-4 text-red-700">
                  {error}
                </div>
              )}

              <div className="mt-7 flex justify-end gap-3 border-t pt-5">
                <button
                  type="button"
                  onClick={() =>
                    setModalVenta(false)
                  }
                  className="rounded-xl border px-5 py-3 font-semibold"
                >
                  Cancelar
                </button>

                <button
                  disabled={guardando}
                  className="rounded-xl bg-red-700 px-6 py-3 font-semibold text-white disabled:opacity-60"
                >
                  {guardando
                    ? "Registrando..."
                    : "Registrar venta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalDetalle && detalleVenta && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-7">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  Detalle de venta
                </h2>

                <p className="mt-1 text-gray-500">
                  {detalleVenta.venta.NUMERO_VENTA}
                </p>
              </div>

              <button
                onClick={() => setModalDetalle(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <Dato
                titulo="Cliente"
                valor={detalleVenta.venta.CLIENTE}
              />
              <Dato
                titulo="Método"
                valor={detalleVenta.venta.METODO_PAGO}
              />
              <Dato
                titulo="Total"
                valor={`S/ ${Number(
                  detalleVenta.venta.TOTAL
                ).toFixed(2)}`}
              />
            </div>

            <div className="mt-7 overflow-x-auto">
              <table className="w-full min-w-[650px]">
                <thead>
                  <tr className="border-b text-left text-sm text-gray-500">
                    <th className="pb-4">Código</th>
                    <th className="pb-4">Producto</th>
                    <th className="pb-4">Cantidad</th>
                    <th className="pb-4">Precio</th>
                    <th className="pb-4">Subtotal</th>
                  </tr>
                </thead>

                <tbody>
                  {detalleVenta.detalle.map((item) => (
                    <tr
                      key={item.IDDETALLE}
                      className="border-b border-gray-100"
                    >
                      <td className="py-4">
                        {item.CODIGO}
                      </td>
                      <td className="py-4 font-semibold">
                        {item.PRODUCTO}
                      </td>
                      <td className="py-4">
                        {item.CANTIDAD}
                      </td>
                      <td className="py-4">
                        S/{" "}
                        {Number(
                          item.PRECIO_UNITARIO
                        ).toFixed(2)}
                      </td>
                      <td className="py-4 font-semibold">
                        S/{" "}
                        {Number(
                          item.SUBTOTAL
                        ).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Dato({ titulo, valor }) {
  return (
    <div className="rounded-2xl bg-gray-50 p-5">
      <p className="text-sm text-gray-500">
        {titulo}
      </p>
      <p className="mt-1 font-bold text-gray-900">
        {valor}
      </p>
    </div>
  );
}

function formatearFecha(fecha) {
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(fecha));
}

export default Sales;