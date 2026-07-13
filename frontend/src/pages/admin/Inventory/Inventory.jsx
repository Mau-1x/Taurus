import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  X,
  LoaderCircle,
  History,
  Check,
  FileUp,
  FileSpreadsheet,
} from "lucide-react";

import {
  obtenerProductos,
  obtenerCategorias,
  obtenerMarcas,
  obtenerModelos,
  obtenerCompatibilidades,
  actualizarCompatibilidades,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  moverStock,
  obtenerMovimientos,
  importarModelos,
} from "../../../services/productoService";

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
  const [modelosPrincipales, setModelosPrincipales] = useState([]);
  const [todosModelos, setTodosModelos] = useState([]);

  const [
    compatibilidadesSeleccionadas,
    setCompatibilidadesSeleccionadas,
  ] = useState([]);

  const [busquedaModeloCompatible, setBusquedaModeloCompatible] =
    useState("");

  const [filtroMarcaCompatible, setFiltroMarcaCompatible] =
    useState("");

  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");

  const [modalProducto, setModalProducto] = useState(false);
  const [modalStock, setModalStock] = useState(false);
  const [modalHistorial, setModalHistorial] = useState(false);
  const [modalImportacion, setModalImportacion] = useState(false);

  const [productoEditando, setProductoEditando] = useState(null);
  const [productoStock, setProductoStock] = useState(null);

  const [formulario, setFormulario] = useState(formularioInicial);

  const [movimiento, setMovimiento] = useState({
    tipo: "ENTRADA",
    cantidad: 1,
    motivo: "",
  });

  const [movimientos, setMovimientos] = useState([]);

  const [nombreArchivoImportacion, setNombreArchivoImportacion] =
    useState("");
  const [filasImportacion, setFilasImportacion] = useState([]);
  const [importando, setImportando] = useState(false);
  const [errorImportacion, setErrorImportacion] = useState("");
  const [resultadoImportacion, setResultadoImportacion] =
    useState(null);

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
        datosModelos,
      ] = await Promise.all([
        obtenerProductos(),
        obtenerCategorias(),
        obtenerMarcas(),
        obtenerModelos(),
      ]);

      setProductos(datosProductos);
      setCategorias(datosCategorias);
      setMarcas(datosMarcas);
      setTodosModelos(datosModelos);
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
        producto.MODELO?.toLowerCase().includes(texto) ||
        producto.MODELOS_COMPATIBLES?.toLowerCase().includes(texto);

      const coincideCategoria =
        !filtroCategoria ||
        String(producto.IDCATEGORIA) === String(filtroCategoria);

      return coincideTexto && coincideCategoria;
    });
  }, [productos, busqueda, filtroCategoria]);

  const modelosCompatiblesFiltrados = useMemo(() => {
    const texto = busquedaModeloCompatible.trim().toLowerCase();

    return todosModelos.filter((modelo) => {
      const coincideMarca =
        !filtroMarcaCompatible ||
        String(modelo.IDMARCA) === String(filtroMarcaCompatible);

      const nombreCompleto =
        `${modelo.MARCA || ""} ${modelo.NOMBRE || ""}`.toLowerCase();

      return coincideMarca && (!texto || nombreCompleto.includes(texto));
    });
  }, [
    todosModelos,
    busquedaModeloCompatible,
    filtroMarcaCompatible,
  ]);

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
    setModelosPrincipales([]);
    setCompatibilidadesSeleccionadas([]);
    setBusquedaModeloCompatible("");
    setFiltroMarcaCompatible("");
    setError("");
    setModalProducto(true);
  }

  async function abrirEditar(producto) {
    try {
      setProductoEditando(producto);
      setError("");

      const promesaModelos = producto.IDMARCA
        ? obtenerModelos(producto.IDMARCA)
        : Promise.resolve([]);

      const [modelosMarca, compatibilidades] = await Promise.all([
        promesaModelos,
        obtenerCompatibilidades(producto.IDPRODUCTO),
      ]);

      setModelosPrincipales(modelosMarca);
      setCompatibilidadesSeleccionadas(
        compatibilidades.map((item) => Number(item.IDMODELO))
      );
      setBusquedaModeloCompatible("");
      setFiltroMarcaCompatible("");

      setFormulario({
        idCategoria: producto.IDCATEGORIA || "",
        idMarca: producto.IDMARCA || "",
        idModelo: producto.IDMODELO || "",
        codigo: producto.CODIGO || "",
        nombre: producto.NOMBRE || "",
        descripcion: producto.DESCRIPCION || "",
        precioCompra: producto.PRECIO_COMPRA ?? "",
        precioVenta: producto.PRECIO_VENTA ?? "",
        stock: producto.STOCK || 0,
        stockMinimo: producto.STOCK_MINIMO ?? 2,
        imagen: producto.IMAGEN || "",
      });

      setModalProducto(true);
    } catch (errorEdicion) {
      setError(errorEdicion.message);
    }
  }

  async function manejarCambio(evento) {
    const { name } = evento.target;
    let { value } = evento.target;

    if (name === "codigo") {
      value = value
        .replace(/[^a-zA-Z0-9_-]/g, "")
        .toUpperCase()
        .slice(0, 30);
    }

    if (name === "nombre") value = value.slice(0, 150);
    if (name === "descripcion") value = value.slice(0, 500);
    if (name === "imagen") value = value.slice(0, 500);

    if (
      (name === "precioCompra" || name === "precioVenta") &&
      !/^\d{0,8}(\.\d{0,2})?$/.test(value)
    ) {
      return;
    }

    if (name === "stock" || name === "stockMinimo") {
      value = value.replace(/\D/g, "").slice(0, 6);
    }

    if (name === "idMarca") {
      setFormulario((anterior) => ({
        ...anterior,
        idMarca: value,
        idModelo: "",
      }));

      try {
        setModelosPrincipales(
          value ? await obtenerModelos(value) : []
        );
      } catch (errorModelos) {
        setError(errorModelos.message);
      }

      return;
    }

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  function alternarCompatibilidad(idModelo) {
    const id = Number(idModelo);

    setCompatibilidadesSeleccionadas((anteriores) =>
      anteriores.includes(id)
        ? anteriores.filter((item) => item !== id)
        : [...anteriores, id]
    );
  }

  function seleccionarModelosVisibles() {
    const visibles = modelosCompatiblesFiltrados.map((modelo) =>
      Number(modelo.IDMODELO)
    );

    setCompatibilidadesSeleccionadas((anteriores) => [
      ...new Set([...anteriores, ...visibles]),
    ]);
  }

  function limpiarCompatibilidades() {
    setCompatibilidadesSeleccionadas([]);
  }

  async function manejarGuardar(evento) {
    evento.preventDefault();

    try {
      setGuardando(true);
      setError("");

      if (!formulario.idCategoria) {
        throw new Error("Selecciona una categoría");
      }

      if (
        !/^[A-Za-z0-9_-]{2,30}$/.test(formulario.codigo.trim())
      ) {
        throw new Error(
          "El código debe tener entre 2 y 30 caracteres"
        );
      }

      if (
        formulario.nombre.trim().length < 2 ||
        formulario.nombre.trim().length > 150
      ) {
        throw new Error(
          "El nombre debe tener entre 2 y 150 caracteres"
        );
      }

      if (formulario.descripcion.length > 500) {
        throw new Error(
          "La descripción no puede superar los 500 caracteres"
        );
      }

      const precioCompra = Number(formulario.precioCompra);
      const precioVenta = Number(formulario.precioVenta);

      if (!Number.isFinite(precioCompra) || precioCompra < 0) {
        throw new Error("El precio de compra no es válido");
      }

      if (!Number.isFinite(precioVenta) || precioVenta < 0) {
        throw new Error("El precio de venta no es válido");
      }

      if (precioVenta < precioCompra) {
        throw new Error(
          "El precio de venta no puede ser menor al precio de compra"
        );
      }

      if (
        !productoEditando &&
        (!Number.isInteger(Number(formulario.stock)) ||
          Number(formulario.stock) < 0)
      ) {
        throw new Error(
          "El stock inicial debe ser un número entero mayor o igual a cero"
        );
      }

      if (
        !Number.isInteger(Number(formulario.stockMinimo)) ||
        Number(formulario.stockMinimo) < 0
      ) {
        throw new Error(
          "El stock mínimo debe ser un número entero mayor o igual a cero"
        );
      }

      if (formulario.idModelo && !formulario.idMarca) {
        throw new Error(
          "Debes seleccionar una marca antes del modelo principal"
        );
      }

      if (
        formulario.imagen &&
        !/^https?:\/\/.+/i.test(formulario.imagen)
      ) {
        throw new Error(
          "La URL de la imagen debe comenzar con http:// o https://"
        );
      }

      const datos = {
        ...formulario,
        idCategoria: Number(formulario.idCategoria),
        idMarca: formulario.idMarca
          ? Number(formulario.idMarca)
          : null,
        idModelo: formulario.idModelo
          ? Number(formulario.idModelo)
          : null,
        precioCompra,
        precioVenta,
        stock: Number(formulario.stock || 0),
        stockMinimo: Number(formulario.stockMinimo || 0),
      };

      let idProductoGuardado;

      if (productoEditando) {
        await actualizarProducto(
          productoEditando.IDPRODUCTO,
          datos
        );
        idProductoGuardado = productoEditando.IDPRODUCTO;
      } else {
        const resultado = await crearProducto(datos);
        idProductoGuardado = resultado.data?.idProducto;

        if (!idProductoGuardado) {
          throw new Error(
            "El producto se creó, pero no se recibió su identificador"
          );
        }
      }

      await actualizarCompatibilidades(
        idProductoGuardado,
        compatibilidadesSeleccionadas
      );

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

      const cantidad = Number(movimiento.cantidad);

      if (
        !Number.isInteger(cantidad) ||
        cantidad < 0 ||
        cantidad > 999999
      ) {
        throw new Error(
          "La cantidad debe ser un número entero entre 0 y 999999"
        );
      }

      if (movimiento.tipo !== "AJUSTE" && cantidad === 0) {
        throw new Error("La cantidad debe ser mayor que cero");
      }

      if (
        movimiento.tipo === "SALIDA" &&
        cantidad > Number(productoStock.STOCK)
      ) {
        throw new Error(
          "La salida no puede superar el stock disponible"
        );
      }

      if (movimiento.motivo.trim().length < 3) {
        throw new Error(
          "Indica un motivo de al menos 3 caracteres"
        );
      }

      if (movimiento.motivo.length > 300) {
        throw new Error(
          "El motivo no puede superar los 300 caracteres"
        );
      }

      await moverStock(productoStock.IDPRODUCTO, {
        tipo: movimiento.tipo,
        cantidad,
        motivo: movimiento.motivo.trim(),
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

      const datos = await obtenerMovimientos(producto.IDPRODUCTO);

      setMovimientos(datos);
      setModalHistorial(true);
    } catch (errorHistorial) {
      setError(errorHistorial.message);
    }
  }

  function abrirImportacion() {
    setNombreArchivoImportacion("");
    setFilasImportacion([]);
    setErrorImportacion("");
    setResultadoImportacion(null);
    setModalImportacion(true);
  }

  async function manejarArchivoImportacion(evento) {
    const archivo = evento.target.files?.[0];

    setNombreArchivoImportacion("");
    setFilasImportacion([]);
    setErrorImportacion("");
    setResultadoImportacion(null);

    if (!archivo) return;

    try {
      if (archivo.size > 5 * 1024 * 1024) {
        throw new Error(
          "El archivo no puede superar los 5 MB"
        );
      }

      if (!archivo.name.toLowerCase().endsWith(".csv")) {
        throw new Error(
          "Selecciona un archivo con extensión .csv"
        );
      }

      const contenido = await archivo.text();
      const filas = parsearCatalogoCSV(contenido);

      if (filas.length === 0) {
        throw new Error(
          "El archivo no contiene marcas y modelos válidos"
        );
      }

      if (filas.length > 5000) {
        throw new Error(
          "Solo se permiten hasta 5000 modelos por importación"
        );
      }

      setNombreArchivoImportacion(archivo.name);
      setFilasImportacion(filas);
    } catch (errorArchivo) {
      evento.target.value = "";
      setErrorImportacion(errorArchivo.message);
    }
  }

  async function ejecutarImportacion() {
    try {
      if (filasImportacion.length === 0) {
        throw new Error(
          "Primero selecciona un archivo CSV válido"
        );
      }

      setImportando(true);
      setErrorImportacion("");
      setResultadoImportacion(null);

      const respuesta = await importarModelos(
        filasImportacion
      );

      setResultadoImportacion(respuesta.data);
      await cargarDatos();
    } catch (errorCarga) {
      setErrorImportacion(errorCarga.message);
    } finally {
      setImportando(false);
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
            Controla productos, precios, stock y compatibilidad con
            dispositivos.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={abrirImportacion}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <FileUp size={20} />
            Importar modelos
          </button>

          <button
            type="button"
            onClick={abrirNuevo}
            className="flex items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-3 font-semibold text-white hover:bg-red-800"
          >
            <Plus size={20} />
            Nuevo producto
          </button>
        </div>
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
        !modalHistorial &&
        !modalImportacion && (
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
              onChange={(evento) => setBusqueda(evento.target.value)}
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
            <table className="w-full min-w-[1250px]">
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
                  <th className="pb-4 text-right">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {productosFiltrados.map((producto) => {
                  const compatibilidad =
                    producto.MODELOS_COMPATIBLES ||
                    [producto.MARCA, producto.MODELO]
                      .filter(Boolean)
                      .join(" ") ||
                    "Universal";

                  return (
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
                          {producto.DESCRIPCION || "Sin descripción"}
                        </p>
                      </td>

                      <td className="py-4">
                        {producto.CATEGORIA}
                      </td>

                      <td className="max-w-[320px] py-4">
                        <p
                          className="line-clamp-2"
                          title={compatibilidad}
                        >
                          {compatibilidad}
                        </p>
                      </td>

                      <td className="py-4">
                        S/{" "}
                        {Number(producto.PRECIO_COMPRA).toFixed(2)}
                      </td>

                      <td className="py-4 font-semibold text-red-700">
                        S/{" "}
                        {Number(producto.PRECIO_VENTA).toFixed(2)}
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
                            type="button"
                            onClick={() =>
                              abrirMovimiento(producto, "ENTRADA")
                            }
                            title="Registrar entrada"
                            className="rounded-lg bg-green-50 p-2 text-green-700"
                          >
                            <ArrowDownToLine size={18} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              abrirMovimiento(producto, "SALIDA")
                            }
                            title="Registrar salida"
                            className="rounded-lg bg-amber-50 p-2 text-amber-700"
                          >
                            <ArrowUpFromLine size={18} />
                          </button>

                          <button
                            type="button"
                            onClick={() => abrirHistorial(producto)}
                            title="Historial"
                            className="rounded-lg bg-purple-50 p-2 text-purple-700"
                          >
                            <History size={18} />
                          </button>

                          <button
                            type="button"
                            onClick={() => abrirEditar(producto)}
                            title="Editar"
                            className="rounded-lg bg-blue-50 p-2 text-blue-700"
                          >
                            <Pencil size={18} />
                          </button>

                          <button
                            type="button"
                            onClick={() => manejarEliminar(producto)}
                            title="Eliminar"
                            className="rounded-lg bg-red-50 p-2 text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

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

      {modalImportacion && (
        <ModalImportacion
          nombreArchivo={nombreArchivoImportacion}
          filas={filasImportacion}
          importando={importando}
          error={errorImportacion}
          resultado={resultadoImportacion}
          seleccionarArchivo={manejarArchivoImportacion}
          importar={ejecutarImportacion}
          cerrar={() => {
            if (!importando) {
              setModalImportacion(false);
            }
          }}
        />
      )}

      {modalProducto && (
        <ModalProducto
          formulario={formulario}
          categorias={categorias}
          marcas={marcas}
          modelosPrincipales={modelosPrincipales}
          modelosCompatibles={modelosCompatiblesFiltrados}
          compatibilidadesSeleccionadas={
            compatibilidadesSeleccionadas
          }
          busquedaModeloCompatible={busquedaModeloCompatible}
          setBusquedaModeloCompatible={
            setBusquedaModeloCompatible
          }
          filtroMarcaCompatible={filtroMarcaCompatible}
          setFiltroMarcaCompatible={setFiltroMarcaCompatible}
          alternarCompatibilidad={alternarCompatibilidad}
          seleccionarModelosVisibles={
            seleccionarModelosVisibles
          }
          limpiarCompatibilidades={limpiarCompatibilidades}
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

function ModalImportacion({
  nombreArchivo,
  filas,
  importando,
  error,
  resultado,
  seleccionarArchivo,
  importar,
  cerrar,
}) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-7 py-5">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Importar marcas y modelos
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Sube un CSV con las columnas MARCA y MODELO.
            </p>
          </div>

          <button
            type="button"
            onClick={cerrar}
            disabled={importando}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6 p-7">
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-blue-900">
            <p className="font-semibold">
              Formato requerido
            </p>

            <pre className="mt-3 overflow-x-auto rounded-xl bg-white p-4 text-sm text-gray-700">
{`MARCA,MODELO
Samsung,Galaxy A15
Apple,iPhone 13
Xiaomi,Redmi Note 13 Pro`}
            </pre>

            <p className="mt-3 text-sm leading-6">
              También se acepta punto y coma como separador.
              Las filas duplicadas se omiten automáticamente.
            </p>
          </div>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center transition hover:border-red-400 hover:bg-red-50">
            <FileSpreadsheet
              size={42}
              className="text-red-700"
            />

            <span className="mt-4 font-bold text-gray-900">
              Seleccionar archivo CSV
            </span>

            <span className="mt-2 text-sm text-gray-500">
              Máximo 5 MB y 5000 modelos
            </span>

            <input
              type="file"
              accept=".csv,text/csv"
              onChange={seleccionarArchivo}
              disabled={importando}
              className="hidden"
            />
          </label>

          {nombreArchivo && (
            <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 p-4">
              <div>
                <p className="font-semibold text-gray-900">
                  {nombreArchivo}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {filas.length} modelos válidos encontrados
                </p>
              </div>

              <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                Listo
              </span>
            </div>
          )}

          {filas.length > 0 && (
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">
                  Vista previa
                </h3>

                <p className="text-sm text-gray-500">
                  Primeras {Math.min(filas.length, 10)} filas
                </p>
              </div>

              <div className="mt-3 overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full min-w-[520px]">
                  <thead className="bg-gray-50 text-left text-sm text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Marca</th>
                      <th className="px-4 py-3">Modelo</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filas.slice(0, 10).map((fila) => (
                      <tr
                        key={`${fila.marca}-${fila.modelo}`}
                        className="border-t border-gray-100"
                      >
                        <td className="px-4 py-3 font-semibold">
                          {fila.marca}
                        </td>
                        <td className="px-4 py-3">
                          {fila.modelo}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {resultado && (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-green-900">
              <h3 className="font-bold">
                Importación completada
              </h3>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <ResumenImportacion
                  titulo="Filas procesadas"
                  valor={resultado.filasProcesadas}
                />
                <ResumenImportacion
                  titulo="Marcas creadas"
                  valor={resultado.marcasCreadas}
                />
                <ResumenImportacion
                  titulo="Marcas reactivadas"
                  valor={resultado.marcasReactivadas}
                />
                <ResumenImportacion
                  titulo="Modelos creados"
                  valor={resultado.modelosCreados}
                />
                <ResumenImportacion
                  titulo="Modelos reactivados"
                  valor={resultado.modelosReactivados}
                />
                <ResumenImportacion
                  titulo="Duplicados omitidos"
                  valor={resultado.duplicados}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 border-t pt-5">
            <button
              type="button"
              onClick={cerrar}
              disabled={importando}
              className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 disabled:opacity-50"
            >
              Cerrar
            </button>

            <button
              type="button"
              onClick={importar}
              disabled={importando || filas.length === 0}
              className="flex items-center gap-2 rounded-xl bg-red-700 px-6 py-3 font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {importando ? (
                <LoaderCircle
                  size={19}
                  className="animate-spin"
                />
              ) : (
                <FileUp size={19} />
              )}

              {importando
                ? "Importando..."
                : `Importar ${filas.length || ""} modelos`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResumenImportacion({ titulo, valor }) {
  return (
    <div className="rounded-xl bg-white p-4">
      <p className="text-sm text-gray-500">
        {titulo}
      </p>
      <p className="mt-1 text-2xl font-bold text-gray-900">
        {Number(valor || 0)}
      </p>
    </div>
  );
}

function TarjetaResumen({ titulo, valor, clase }) {
  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm">
      <div className={`inline-flex rounded-xl p-3 ${clase}`}>
        <Package size={23} />
      </div>

      <p className="mt-4 text-sm text-gray-500">{titulo}</p>

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
  modelosPrincipales,
  modelosCompatibles,
  compatibilidadesSeleccionadas,
  busquedaModeloCompatible,
  setBusquedaModeloCompatible,
  filtroMarcaCompatible,
  setFiltroMarcaCompatible,
  alternarCompatibilidad,
  seleccionarModelosVisibles,
  limpiarCompatibilidades,
  editando,
  guardando,
  error,
  manejarCambio,
  guardar,
  cerrar,
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white">
        <div className="flex items-center justify-between border-b px-7 py-5">
          <div>
            <h2 className="text-2xl font-bold">
              {editando ? "Editar producto" : "Registrar producto"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Registra el producto y los modelos de celular
              compatibles.
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
            maxLength={30}
            placeholder="Ejemplo: MICA-SAM-A15"
            required
          />

          <Campo
            label="Nombre"
            name="nombre"
            value={formulario.nombre}
            onChange={manejarCambio}
            maxLength={150}
            required
          />

          <Campo
            label="URL de imagen"
            name="imagen"
            value={formulario.imagen}
            onChange={manejarCambio}
            maxLength={500}
            placeholder="https://..."
          />

          <Campo
            label="Precio de compra"
            name="precioCompra"
            type="number"
            value={formulario.precioCompra}
            onChange={manejarCambio}
            min="0"
            max="99999999.99"
            step="0.01"
            required
          />

          <Campo
            label="Precio de venta"
            name="precioVenta"
            type="number"
            value={formulario.precioVenta}
            onChange={manejarCambio}
            min="0"
            max="99999999.99"
            step="0.01"
            required
          />

          <Select
            label="Marca principal"
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
            label="Modelo principal"
            name="idModelo"
            value={formulario.idModelo}
            onChange={manejarCambio}
            disabled={!formulario.idMarca}
          >
            <option value="">Universal / sin modelo</option>

            {modelosPrincipales.map((modelo) => (
              <option
                key={modelo.IDMODELO}
                value={modelo.IDMODELO}
              >
                {modelo.NOMBRE}
              </option>
            ))}
          </Select>

          {!editando && (
            <Campo
              label="Stock inicial"
              name="stock"
              type="number"
              value={formulario.stock}
              onChange={manejarCambio}
              min="0"
              max="999999"
              step="1"
              required
            />
          )}

          <Campo
            label="Stock mínimo"
            name="stockMinimo"
            type="number"
            value={formulario.stockMinimo}
            onChange={manejarCambio}
            min="0"
            max="999999"
            step="1"
            required
          />

          <label className="md:col-span-2">
            <span className="mb-2 flex items-center justify-between text-sm font-semibold">
              <span>Descripción</span>
              <span className="text-xs font-normal text-gray-500">
                {formulario.descripcion.length}/500
              </span>
            </span>

            <textarea
              name="descripcion"
              value={formulario.descripcion}
              onChange={manejarCambio}
              rows="4"
              maxLength={500}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600"
            />
          </label>

          <section className="rounded-2xl border border-gray-200 bg-gray-50 p-5 md:col-span-2">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="font-bold text-gray-900">
                  Modelos compatibles
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Úsalo para micas, pantallas, baterías y repuestos
                  compatibles con varios celulares.
                </p>
              </div>

              <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                {compatibilidadesSeleccionadas.length} seleccionados
              </span>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_240px]">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  value={busquedaModeloCompatible}
                  onChange={(evento) =>
                    setBusquedaModeloCompatible(evento.target.value)
                  }
                  placeholder="Buscar marca o modelo"
                  className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 outline-none focus:border-red-600"
                />
              </div>

              <select
                value={filtroMarcaCompatible}
                onChange={(evento) =>
                  setFiltroMarcaCompatible(evento.target.value)
                }
                className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600"
              >
                <option value="">Todas las marcas</option>

                {marcas.map((marca) => (
                  <option
                    key={marca.IDMARCA}
                    value={marca.IDMARCA}
                  >
                    {marca.NOMBRE}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={seleccionarModelosVisibles}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                Seleccionar visibles
              </button>

              <button
                type="button"
                onClick={limpiarCompatibilidades}
                className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
              >
                Limpiar selección
              </button>
            </div>

            <div className="mt-4 max-h-72 overflow-y-auto rounded-xl border border-gray-200 bg-white p-3">
              <div className="grid gap-2 md:grid-cols-2">
                {modelosCompatibles.map((modelo) => {
                  const seleccionado =
                    compatibilidadesSeleccionadas.includes(
                      Number(modelo.IDMODELO)
                    );

                  return (
                    <button
                      key={modelo.IDMODELO}
                      type="button"
                      onClick={() =>
                        alternarCompatibilidad(modelo.IDMODELO)
                      }
                      className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition ${
                        seleccionado
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <span>
                        <span className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
                          {modelo.MARCA}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {modelo.NOMBRE}
                        </span>
                      </span>

                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                          seleccionado
                            ? "bg-red-700 text-white"
                            : "border border-gray-300 text-transparent"
                        }`}
                      >
                        <Check size={15} />
                      </span>
                    </button>
                  );
                })}
              </div>

              {modelosCompatibles.length === 0 && (
                <p className="py-8 text-center text-sm text-gray-500">
                  No se encontraron modelos.
                </p>
              )}
            </div>
          </section>

          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-red-700 md:col-span-2">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t pt-5 md:col-span-2">
            <button
              type="button"
              onClick={cerrar}
              className="rounded-xl border border-gray-300 px-5 py-3 font-semibold"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={guardando}
              className="flex items-center gap-2 rounded-xl bg-red-700 px-6 py-3 font-semibold text-white disabled:opacity-60"
            >
              {guardando && (
                <LoaderCircle size={18} className="animate-spin" />
              )}

              {guardando ? "Guardando..." : "Guardar producto"}
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
              {producto.NOMBRE} — Stock actual: {producto.STOCK}
            </p>
          </div>

          <button type="button" onClick={cerrar}>
            <X size={24} />
          </button>
        </div>

        <div className="mt-5">
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
        </div>

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
            min="0"
            max="999999"
            step="1"
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
                motivo: evento.target.value.slice(0, 300),
              }))
            }
            rows="3"
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
            maxLength={300}
            required
          />
        </label>

        <p className="mt-1 text-right text-xs text-gray-500">
          {movimiento.motivo.length}/300
        </p>

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
            type="submit"
            disabled={guardando}
            className="rounded-xl bg-red-700 px-6 py-3 font-semibold text-white disabled:opacity-60"
          >
            {guardando
              ? "Guardando..."
              : "Registrar movimiento"}
          </button>
        </div>
      </form>
    </div>
  );
}

function ModalHistorial({ producto, movimientos, cerrar }) {
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

          <button type="button" onClick={cerrar}>
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
                  <td className="py-4">{item.CANTIDAD}</td>
                  <td className="py-4">
                    {item.STOCK_ANTERIOR}
                  </td>
                  <td className="py-4">{item.STOCK_NUEVO}</td>
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
  min,
  max,
  step,
  maxLength,
  placeholder,
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </span>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        min={min}
        max={max}
        step={step}
        maxLength={maxLength}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600"
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
  disabled = false,
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </span>

      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600 disabled:cursor-not-allowed disabled:bg-gray-100"
      >
        {children}
      </select>
    </label>
  );
}

function parsearCatalogoCSV(contenido) {
  const texto = String(contenido || "")
    .replace(/^\uFEFF/, "")
    .trim();

  if (!texto) {
    return [];
  }

  const primeraLinea =
    texto.split(/\r?\n/).find((linea) =>
      linea.trim()
    ) || "";

  const separador =
    contarCaracter(primeraLinea, ";") >
    contarCaracter(primeraLinea, ",")
      ? ";"
      : ",";

  const matriz = parsearFilasCSV(
    texto,
    separador
  );

  if (matriz.length < 2) {
    throw new Error(
      "El CSV debe incluir encabezados y al menos una fila"
    );
  }

  const encabezados = matriz[0].map(
    normalizarEncabezado
  );

  const indiceMarca =
    encabezados.indexOf("MARCA");

  const indiceModelo =
    encabezados.indexOf("MODELO");

  if (
    indiceMarca === -1 ||
    indiceModelo === -1
  ) {
    throw new Error(
      "El CSV debe tener las columnas MARCA y MODELO"
    );
  }

  const filas = [];
  const claves = new Set();

  for (const columnas of matriz.slice(1)) {
    const marca = String(
      columnas[indiceMarca] || ""
    )
      .trim()
      .replace(/\s+/g, " ");

    const modelo = String(
      columnas[indiceModelo] || ""
    )
      .trim()
      .replace(/\s+/g, " ");

    if (!marca || !modelo) continue;

    if (marca.length > 100) {
      throw new Error(
        `La marca "${marca}" supera los 100 caracteres`
      );
    }

    if (modelo.length > 150) {
      throw new Error(
        `El modelo "${modelo}" supera los 150 caracteres`
      );
    }

    const clave =
      `${marca}|${modelo}`.toLocaleUpperCase(
        "es-PE"
      );

    if (claves.has(clave)) continue;

    claves.add(clave);
    filas.push({ marca, modelo });
  }

  return filas;
}

function parsearFilasCSV(texto, separador) {
  const filas = [];
  let fila = [];
  let campo = "";
  let entreComillas = false;

  for (let indice = 0; indice < texto.length; indice++) {
    const caracter = texto[indice];
    const siguiente = texto[indice + 1];

    if (caracter === '"') {
      if (entreComillas && siguiente === '"') {
        campo += '"';
        indice++;
      } else {
        entreComillas = !entreComillas;
      }

      continue;
    }

    if (
      caracter === separador &&
      !entreComillas
    ) {
      fila.push(campo);
      campo = "";
      continue;
    }

    if (
      (caracter === "\n" ||
        caracter === "\r") &&
      !entreComillas
    ) {
      if (
        caracter === "\r" &&
        siguiente === "\n"
      ) {
        indice++;
      }

      fila.push(campo);

      if (
        fila.some((valor) =>
          String(valor).trim()
        )
      ) {
        filas.push(fila);
      }

      fila = [];
      campo = "";
      continue;
    }

    campo += caracter;
  }

  fila.push(campo);

  if (
    fila.some((valor) =>
      String(valor).trim()
    )
  ) {
    filas.push(fila);
  }

  return filas;
}

function normalizarEncabezado(valor) {
  return String(valor || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

function contarCaracter(texto, caracter) {
  return (
    String(texto).split(caracter).length - 1
  );
}

export default Inventory;
