import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  Settings2,
  X,
  LoaderCircle,
  History,
} from "lucide-react";

import {
  obtenerProductos,
  obtenerCategorias,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  moverStock,
  obtenerMovimientos,
} from "../../../services/productoService";

import {
  obtenerMarcas,
  obtenerModelosPorMarca,
} from "../../../services/equipoService";

const formularioInicial = {
  idCategoria: "",
  idMarca: "",
  idModelo: "",
  codigo: "",
  nombre: "",
  descripcion: "",
  precioCompra: "",
  precioVenta: "",
  stock: 0,
  stockMinimo: 2,
  imagen: "",
};

function Inventory() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);

  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");

  const [modalProducto, setModalProducto] = useState(false);
  const [modalStock, setModalStock] = useState(false);
  const [modalHistorial, setModalHistorial] = useState(false);

  const [productoEditando, setProductoEditando] = useState(null);
  const [productoStock, setProductoStock] = useState(null);

  const [formulario, setFormulario] = useState(formularioInicial);

  const [movimiento, setMovimiento] = useState({
    tipo: "ENTRADA",
    cantidad: 1,
    motivo: "",
  });

  const [movimientos, setMovimientos] = useState([]);

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

      const [
        datosProductos,
        datosCategorias,
        datosMarcas,
      ] = await Promise.all([
        obtenerProductos(),
        obtenerCategorias(),
        obtenerMarcas(),
      ]);

      setProductos(datosProductos);
      setCategorias(datosCategorias);
      setMarcas(datosMarcas);
    } catch (errorCarga) {
      setError(errorCarga.message);
    } finally {
      setCargando(false);
    }
  }

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    return productos.filter((producto) => {
      const coincideTexto =
        !texto ||
        producto.CODIGO?.toLowerCase().includes(texto) ||
        producto.NOMBRE?.toLowerCase().includes(texto) ||
        producto.CATEGORIA?.toLowerCase().includes(texto) ||
        producto.MARCA?.toLowerCase().includes(texto) ||
        producto.MODELO?.toLowerCase().includes(texto);

      const coincideCategoria =
        !filtroCategoria ||
        String(producto.IDCATEGORIA) === filtroCategoria;

      return coincideTexto && coincideCategoria;
    });
  }, [productos, busqueda, filtroCategoria]);

  const resumen = useMemo(() => {
    return {
      total: productos.length,
      disponibles: productos.filter(
        (producto) => producto.ESTADO_STOCK === "DISPONIBLE"
      ).length,
      stockBajo: productos.filter(
        (producto) => producto.ESTADO_STOCK === "STOCK BAJO"
      ).length,
      sinStock: productos.filter(
        (producto) => producto.ESTADO_STOCK === "SIN STOCK"
      ).length,
    };
  }, [productos]);

  function abrirNuevo() {
    setProductoEditando(null);
    setFormulario(formularioInicial);
    setModelos([]);
    setError("");
    setModalProducto(true);
  }

  async function abrirEditar(producto) {
    setProductoEditando(producto);
    setError("");

    let modelosMarca = [];

    if (producto.IDMARCA) {
      modelosMarca = await obtenerModelosPorMarca(
        producto.IDMARCA
      );
    }

    setModelos(modelosMarca);

    setFormulario({
      idCategoria: producto.IDCATEGORIA || "",
      idMarca: producto.IDMARCA || "",
      idModelo: producto.IDMODELO || "",
      codigo: producto.CODIGO || "",
      nombre: producto.NOMBRE || "",
      descripcion: producto.DESCRIPCION || "",
      precioCompra: producto.PRECIO_COMPRA || "",
      precioVenta: producto.PRECIO_VENTA || "",
      stock: producto.STOCK || 0,
      stockMinimo: producto.STOCK_MINIMO || 2,
      imagen: producto.IMAGEN || "",
    });

    setModalProducto(true);
  }

  async function manejarCambio(evento) {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));

    if (name === "idMarca") {
      setFormulario((anterior) => ({
        ...anterior,
        idMarca: value,
        idModelo: "",
      }));

      if (value) {
        const datosModelos =
          await obtenerModelosPorMarca(value);

        setModelos(datosModelos);
      } else {
        setModelos([]);
      }
    }
  }

  async function manejarGuardar(evento) {
    evento.preventDefault();

    try {
      setGuardando(true);
      setError("");

      const datos = {
        ...formulario,
        idCategoria: Number(formulario.idCategoria),
        idMarca: formulario.idMarca
          ? Number(formulario.idMarca)
          : null,
        idModelo: formulario.idModelo
          ? Number(formulario.idModelo)
          : null,
        precioCompra: Number(
          formulario.precioCompra || 0
        ),
        precioVenta: Number(
          formulario.precioVenta || 0
        ),
        stock: Number(formulario.stock || 0),
        stockMinimo: Number(
          formulario.stockMinimo || 0
        ),
      };

      if (productoEditando) {
        await actualizarProducto(
          productoEditando.IDPRODUCTO,
          datos
        );
      } else {
        await crearProducto(datos);
      }

      await cargarDatos();
      setModalProducto(false);
    } catch (errorGuardado) {
      setError(errorGuardado.message);
    } finally {
      setGuardando(false);
    }
  }

  async function manejarEliminar(producto) {
    const confirmar = window.confirm(
      `¿Deseas eliminar el producto ${producto.NOMBRE}?`
    );

    if (!confirmar) return;

    try {
      await eliminarProducto(producto.IDPRODUCTO);
      await cargarDatos();
    } catch (errorEliminacion) {
      setError(errorEliminacion.message);
    }
  }

  function abrirMovimiento(producto, tipo = "ENTRADA") {
    setProductoStock(producto);

    setMovimiento({
      tipo,
      cantidad: 1,
      motivo: "",
    });

    setError("");
    setModalStock(true);
  }

  async function guardarMovimiento(evento) {
    evento.preventDefault();

    try {
      setGuardando(true);
      setError("");

      await moverStock(productoStock.IDPRODUCTO, {
        tipo: movimiento.tipo,
        cantidad: Number(movimiento.cantidad),
        motivo: movimiento.motivo || null,
      });

      await cargarDatos();
      setModalStock(false);
    } catch (errorMovimiento) {
      setError(errorMovimiento.message);
    } finally {
      setGuardando(false);
    }
  }

  async function abrirHistorial(producto) {
    try {
      setProductoStock(producto);
      setError("");

      const datos = await obtenerMovimientos(
        producto.IDPRODUCTO
      );

      setMovimientos(datos);
      setModalHistorial(true);
    } catch (errorHistorial) {
      setError(errorHistorial.message);
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
            Inventario
          </h1>

          <p className="mt-2 text-gray-600">
            Controla productos, precios, stock y movimientos.
          </p>
        </div>

        <button
          onClick={abrirNuevo}
          className="flex items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-3 font-semibold text-white hover:bg-red-800"
        >
          <Plus size={20} />
          Nuevo producto
        </button>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <TarjetaResumen
          titulo="Productos"
          valor={resumen.total}
          clase="bg-blue-100 text-blue-700"
        />

        <TarjetaResumen
          titulo="Disponibles"
          valor={resumen.disponibles}
          clase="bg-green-100 text-green-700"
        />

        <TarjetaResumen
          titulo="Stock bajo"
          valor={resumen.stockBajo}
          clase="bg-amber-100 text-amber-700"
        />

        <TarjetaResumen
          titulo="Sin stock"
          valor={resumen.sinStock}
          clase="bg-red-100 text-red-700"
        />
      </div>

      {error &&
        !modalProducto &&
        !modalStock &&
        !modalHistorial && (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">
            {error}
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
              placeholder="Buscar código, producto, marca o modelo"
              className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 outline-none focus:border-red-600"
            />
          </div>

          <select
            value={filtroCategoria}
            onChange={(evento) =>
              setFiltroCategoria(evento.target.value)
            }
            className="rounded-xl border border-gray-300 px-4 py-3"
          >
            <option value="">Todas las categorías</option>

            {categorias.map((categoria) => (
              <option
                key={categoria.IDCATEGORIA}
                value={categoria.IDCATEGORIA}
              >
                {categoria.NOMBRE}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Package size={19} />
            {productosFiltrados.length} productos
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
                  <th className="pb-4">Código</th>
                  <th className="pb-4">Producto</th>
                  <th className="pb-4">Categoría</th>
                  <th className="pb-4">Compatibilidad</th>
                  <th className="pb-4">Compra</th>
                  <th className="pb-4">Venta</th>
                  <th className="pb-4">Stock</th>
                  <th className="pb-4">Estado</th>
                  <th className="pb-4 text-right">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {productosFiltrados.map((producto) => (
                  <tr
                    key={producto.IDPRODUCTO}
                    className="border-b border-gray-100"
                  >
                    <td className="py-4 font-semibold">
                      {producto.CODIGO}
                    </td>

                    <td className="py-4">
                      <p className="font-semibold text-gray-900">
                        {producto.NOMBRE}
                      </p>

                      <p className="max-w-[260px] truncate text-sm text-gray-500">
                        {producto.DESCRIPCION ||
                          "Sin descripción"}
                      </p>
                    </td>

                    <td className="py-4">
                      {producto.CATEGORIA}
                    </td>

                    <td className="py-4">
                      {producto.MARCA || "Universal"}{" "}
                      {producto.MODELO || ""}
                    </td>

                    <td className="py-4">
                      S/{" "}
                      {Number(
                        producto.PRECIO_COMPRA
                      ).toFixed(2)}
                    </td>

                    <td className="py-4 font-semibold text-red-700">
                      S/{" "}
                      {Number(
                        producto.PRECIO_VENTA
                      ).toFixed(2)}
                    </td>

                    <td className="py-4 font-bold">
                      {producto.STOCK}
                    </td>

                    <td className="py-4">
                      <EstadoStock
                        estado={producto.ESTADO_STOCK}
                      />
                    </td>

                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            abrirMovimiento(
                              producto,
                              "ENTRADA"
                            )
                          }
                          title="Registrar entrada"
                          className="rounded-lg bg-green-50 p-2 text-green-700"
                        >
                          <ArrowDownToLine size={18} />
                        </button>

                        <button
                          onClick={() =>
                            abrirMovimiento(
                              producto,
                              "SALIDA"
                            )
                          }
                          title="Registrar salida"
                          className="rounded-lg bg-amber-50 p-2 text-amber-700"
                        >
                          <ArrowUpFromLine size={18} />
                        </button>

                        <button
                          onClick={() =>
                            abrirHistorial(producto)
                          }
                          title="Historial"
                          className="rounded-lg bg-purple-50 p-2 text-purple-700"
                        >
                          <History size={18} />
                        </button>

                        <button
                          onClick={() =>
                            abrirEditar(producto)
                          }
                          title="Editar"
                          className="rounded-lg bg-blue-50 p-2 text-blue-700"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          onClick={() =>
                            manejarEliminar(producto)
                          }
                          title="Eliminar"
                          className="rounded-lg bg-red-50 p-2 text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {productosFiltrados.length === 0 && (
                  <tr>
                    <td
                      colSpan="9"
                      className="py-16 text-center text-gray-500"
                    >
                      No se encontraron productos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalProducto && (
        <ModalProducto
          formulario={formulario}
          categorias={categorias}
          marcas={marcas}
          modelos={modelos}
          editando={productoEditando}
          guardando={guardando}
          error={error}
          manejarCambio={manejarCambio}
          guardar={manejarGuardar}
          cerrar={() => setModalProducto(false)}
        />
      )}

      {modalStock && (
        <ModalStock
          producto={productoStock}
          movimiento={movimiento}
          setMovimiento={setMovimiento}
          guardar={guardarMovimiento}
          guardando={guardando}
          error={error}
          cerrar={() => setModalStock(false)}
        />
      )}

      {modalHistorial && (
        <ModalHistorial
          producto={productoStock}
          movimientos={movimientos}
          cerrar={() => setModalHistorial(false)}
        />
      )}
    </section>
  );
}

function TarjetaResumen({ titulo, valor, clase }) {
  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm">
      <div
        className={`inline-flex rounded-xl p-3 ${clase}`}
      >
        <Package size={23} />
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

function EstadoStock({ estado }) {
  const clases = {
    DISPONIBLE: "bg-green-100 text-green-700",
    "STOCK BAJO": "bg-amber-100 text-amber-700",
    "SIN STOCK": "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-semibold ${
        clases[estado] || "bg-gray-100 text-gray-700"
      }`}
    >
      {estado}
    </span>
  );
}

function ModalProducto({
  formulario,
  categorias,
  marcas,
  modelos,
  editando,
  guardando,
  error,
  manejarCambio,
  guardar,
  cerrar,
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white">
        <div className="flex items-center justify-between border-b px-7 py-5">
          <h2 className="text-2xl font-bold">
            {editando
              ? "Editar producto"
              : "Registrar producto"}
          </h2>

          <button onClick={cerrar}>
            <X size={24} />
          </button>
        </div>

        <form
          onSubmit={guardar}
          className="grid gap-5 p-7 md:grid-cols-2"
        >
          <Select
            label="Categoría"
            name="idCategoria"
            value={formulario.idCategoria}
            onChange={manejarCambio}
            required
          >
            <option value="">Seleccionar categoría</option>

            {categorias.map((categoria) => (
              <option
                key={categoria.IDCATEGORIA}
                value={categoria.IDCATEGORIA}
              >
                {categoria.NOMBRE}
              </option>
            ))}
          </Select>

          <Campo
            label="Código"
            name="codigo"
            value={formulario.codigo}
            onChange={manejarCambio}
            required
          />

          <Campo
            label="Nombre"
            name="nombre"
            value={formulario.nombre}
            onChange={manejarCambio}
            required
          />

          <Select
            label="Marca"
            name="idMarca"
            value={formulario.idMarca}
            onChange={manejarCambio}
          >
            <option value="">Universal / sin marca</option>

            {marcas.map((marca) => (
              <option
                key={marca.IDMARCA}
                value={marca.IDMARCA}
              >
                {marca.NOMBRE}
              </option>
            ))}
          </Select>

          <Select
            label="Modelo compatible"
            name="idModelo"
            value={formulario.idModelo}
            onChange={manejarCambio}
          >
            <option value="">Universal / sin modelo</option>

            {modelos.map((modelo) => (
              <option
                key={modelo.IDMODELO}
                value={modelo.IDMODELO}
              >
                {modelo.NOMBRE}
              </option>
            ))}
          </Select>

          <Campo
            label="Precio de compra"
            name="precioCompra"
            type="number"
            value={formulario.precioCompra}
            onChange={manejarCambio}
          />

          <Campo
            label="Precio de venta"
            name="precioVenta"
            type="number"
            value={formulario.precioVenta}
            onChange={manejarCambio}
          />

          {!editando && (
            <Campo
              label="Stock inicial"
              name="stock"
              type="number"
              value={formulario.stock}
              onChange={manejarCambio}
            />
          )}

          <Campo
            label="Stock mínimo"
            name="stockMinimo"
            type="number"
            value={formulario.stockMinimo}
            onChange={manejarCambio}
          />

          <Campo
            label="URL de imagen"
            name="imagen"
            value={formulario.imagen}
            onChange={manejarCambio}
          />

          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-semibold">
              Descripción
            </span>

            <textarea
              name="descripcion"
              value={formulario.descripcion}
              onChange={manejarCambio}
              rows="4"
              className="w-full rounded-xl border border-gray-300 px-4 py-3"
            />
          </label>

          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-red-700 md:col-span-2">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t pt-5 md:col-span-2">
            <button
              type="button"
              onClick={cerrar}
              className="rounded-xl border px-5 py-3 font-semibold"
            >
              Cancelar
            </button>

            <button
              disabled={guardando}
              className="rounded-xl bg-red-700 px-6 py-3 font-semibold text-white"
            >
              {guardando ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ModalStock({
  producto,
  movimiento,
  setMovimiento,
  guardar,
  guardando,
  error,
  cerrar,
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <form
        onSubmit={guardar}
        className="w-full max-w-lg rounded-3xl bg-white p-7"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              Movimiento de stock
            </h2>

            <p className="mt-1 text-gray-500">
              {producto.NOMBRE} — Stock actual:{" "}
              {producto.STOCK}
            </p>
          </div>

          <button type="button" onClick={cerrar}>
            <X size={24} />
          </button>
        </div>

        <Select
          label="Tipo"
          value={movimiento.tipo}
          onChange={(evento) =>
            setMovimiento((anterior) => ({
              ...anterior,
              tipo: evento.target.value,
            }))
          }
        >
          <option value="ENTRADA">Entrada</option>
          <option value="SALIDA">Salida</option>
          <option value="AJUSTE">Ajuste total</option>
        </Select>

        <div className="mt-5">
          <Campo
            label={
              movimiento.tipo === "AJUSTE"
                ? "Nuevo stock total"
                : "Cantidad"
            }
            type="number"
            value={movimiento.cantidad}
            onChange={(evento) =>
              setMovimiento((anterior) => ({
                ...anterior,
                cantidad: evento.target.value,
              }))
            }
            required
          />
        </div>

        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-semibold">
            Motivo
          </span>

          <textarea
            value={movimiento.motivo}
            onChange={(evento) =>
              setMovimiento((anterior) => ({
                ...anterior,
                motivo: evento.target.value,
              }))
            }
            rows="3"
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
          />
        </label>

        {error && (
          <div className="mt-5 rounded-xl bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={cerrar}
            className="rounded-xl border px-5 py-3 font-semibold"
          >
            Cancelar
          </button>

          <button
            disabled={guardando}
            className="rounded-xl bg-red-700 px-6 py-3 font-semibold text-white"
          >
            {guardando ? "Guardando..." : "Registrar movimiento"}
          </button>
        </div>
      </form>
    </div>
  );
}

function ModalHistorial({
  producto,
  movimientos,
  cerrar,
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-7">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              Historial de inventario
            </h2>

            <p className="mt-1 text-gray-500">
              {producto.NOMBRE}
            </p>
          </div>

          <button onClick={cerrar}>
            <X size={24} />
          </button>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[750px]">
            <thead>
              <tr className="border-b text-left text-sm text-gray-500">
                <th className="pb-4">Tipo</th>
                <th className="pb-4">Cantidad</th>
                <th className="pb-4">Anterior</th>
                <th className="pb-4">Nuevo</th>
                <th className="pb-4">Motivo</th>
                <th className="pb-4">Fecha</th>
              </tr>
            </thead>

            <tbody>
              {movimientos.map((item) => (
                <tr
                  key={item.IDMOVIMIENTO}
                  className="border-b border-gray-100"
                >
                  <td className="py-4 font-semibold">
                    {item.TIPO}
                  </td>

                  <td className="py-4">
                    {item.CANTIDAD}
                  </td>

                  <td className="py-4">
                    {item.STOCK_ANTERIOR}
                  </td>

                  <td className="py-4">
                    {item.STOCK_NUEVO}
                  </td>

                  <td className="py-4">
                    {item.MOTIVO || "Sin motivo"}
                  </td>

                  <td className="py-4">
                    {new Intl.DateTimeFormat("es-PE", {
                      dateStyle: "short",
                      timeStyle: "short",
                    }).format(new Date(item.FECHA))}
                  </td>
                </tr>
              ))}

              {movimientos.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="py-14 text-center text-gray-500"
                  >
                    No existen movimientos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold">
        {label}
      </span>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        min={type === "number" ? "0" : undefined}
        step={type === "number" ? "0.01" : undefined}
        className="w-full rounded-xl border border-gray-300 px-4 py-3"
      />
    </label>
  );
}

function Select({
  label,
  name,
  value,
  onChange,
  children,
  required = false,
}) {
  return (
    <label className="mt-5 block">
      <span className="mb-2 block text-sm font-semibold">
        {label}
      </span>

      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-xl border border-gray-300 px-4 py-3"
      >
        {children}
      </select>
    </label>
  );
}

export default Inventory;