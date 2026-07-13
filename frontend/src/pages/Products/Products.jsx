import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Package,
  ShoppingBag,
  LoaderCircle,
  AlertCircle,
  ImageOff,
  Eye,
  MessageCircle,
  X,
  ArrowUpDown,
  BadgeCheck,
  RefreshCcw,
  Headphones,
  Smartphone,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";

import {
  obtenerProductos,
  obtenerCategorias,
  obtenerMarcas,
  obtenerModelos,
} from "../../services/productoService";

const WHATSAPP_NUMBER = String(
  import.meta.env.VITE_WHATSAPP_NUMBER || ""
).replace(/\D/g, "");

function normalizarTexto(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function esCategoriaCelular(nombreCategoria) {
  const nombre = normalizarTexto(nombreCategoria);

  return [
    "celular",
    "telefono",
    "smartphone",
    "equipo movil",
    "movil",
  ].some((palabra) => nombre.includes(palabra));
}

function Products() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);

  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState("");
  const [marcaSeleccionada, setMarcaSeleccionada] =
    useState("");
  const [modeloSeleccionado, setModeloSeleccionado] =
    useState("");
  const [tipoCatalogo, setTipoCatalogo] = useState("todos");
  const [orden, setOrden] = useState("recientes");

  const [productoDetalle, setProductoDetalle] =
    useState(null);

  const [cargando, setCargando] = useState(true);
  const [cargandoModelos, setCargandoModelos] =
    useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarFiltros();
  }, []);

  useEffect(() => {
    cargarProductos();
  }, [marcaSeleccionada, modeloSeleccionado]);

  async function cargarFiltros() {
    try {
      const [datosCategorias, datosMarcas] =
        await Promise.all([
          obtenerCategorias(),
          obtenerMarcas(),
        ]);

      setCategorias(datosCategorias);
      setMarcas(datosMarcas);
    } catch (errorCarga) {
      setError(errorCarga.message);
    }
  }

  async function cargarProductos() {
    try {
      setCargando(true);
      setError("");

      const datosProductos = await obtenerProductos({
        idMarca: marcaSeleccionada,
        idModelo: modeloSeleccionado,
      });

      setProductos(
        datosProductos.filter(
          (producto) => Number(producto.STOCK) > 0
        )
      );
    } catch (errorCarga) {
      setError(errorCarga.message);
    } finally {
      setCargando(false);
    }
  }

  async function cambiarMarca(evento) {
    const idMarca = evento.target.value;

    setMarcaSeleccionada(idMarca);
    setModeloSeleccionado("");
    setModelos([]);

    if (!idMarca) return;

    try {
      setCargandoModelos(true);
      setError("");

      const datosModelos = await obtenerModelos(idMarca);
      setModelos(datosModelos);
    } catch (errorModelos) {
      setError(errorModelos.message);
    } finally {
      setCargandoModelos(false);
    }
  }

  function limpiarFiltros() {
    setBusqueda("");
    setCategoriaSeleccionada("");
    setMarcaSeleccionada("");
    setModeloSeleccionado("");
    setTipoCatalogo("todos");
    setOrden("recientes");
    setModelos([]);
  }

  const productosFiltrados = useMemo(() => {
    const texto = normalizarTexto(busqueda);

    const resultado = productos.filter((producto) => {
      const contenidoBusqueda = normalizarTexto(
        [
          producto.NOMBRE,
          producto.CODIGO,
          producto.CATEGORIA,
          producto.MARCA,
          producto.MODELO,
          producto.MODELOS_COMPATIBLES,
          producto.DESCRIPCION,
        ]
          .filter(Boolean)
          .join(" ")
      );

      const coincideTexto =
        !texto || contenidoBusqueda.includes(texto);

      const coincideCategoria =
        !categoriaSeleccionada ||
        String(producto.IDCATEGORIA) ===
          String(categoriaSeleccionada);

      const productoEsCelular = esCategoriaCelular(
        producto.CATEGORIA
      );

      const coincideTipo =
        tipoCatalogo === "todos" ||
        (tipoCatalogo === "celulares" &&
          productoEsCelular) ||
        (tipoCatalogo === "accesorios" &&
          !productoEsCelular);

      return (
        coincideTexto &&
        coincideCategoria &&
        coincideTipo
      );
    });

    return [...resultado].sort(
      (productoA, productoB) => {
        switch (orden) {
          case "precio-menor":
            return (
              Number(productoA.PRECIO_VENTA) -
              Number(productoB.PRECIO_VENTA)
            );

          case "precio-mayor":
            return (
              Number(productoB.PRECIO_VENTA) -
              Number(productoA.PRECIO_VENTA)
            );

          case "nombre":
            return String(
              productoA.NOMBRE
            ).localeCompare(
              String(productoB.NOMBRE),
              "es"
            );

          case "stock":
            return (
              Number(productoB.STOCK) -
              Number(productoA.STOCK)
            );

          case "recientes":
          default:
            return (
              Number(productoB.IDPRODUCTO) -
              Number(productoA.IDPRODUCTO)
            );
        }
      }
    );
  }, [
    productos,
    busqueda,
    categoriaSeleccionada,
    tipoCatalogo,
    orden,
  ]);

  const resumen = useMemo(() => {
    return {
      total: productos.length,
      celulares: productos.filter((producto) =>
        esCategoriaCelular(producto.CATEGORIA)
      ).length,
      accesorios: productos.filter(
        (producto) =>
          !esCategoriaCelular(producto.CATEGORIA)
      ).length,
    };
  }, [productos]);

  function obtenerNombreMarcaSeleccionada() {
    return (
      marcas.find(
        (marca) =>
          String(marca.IDMARCA) ===
          String(marcaSeleccionada)
      )?.NOMBRE || ""
    );
  }

  function obtenerNombreModeloSeleccionado() {
    return (
      modelos.find(
        (modelo) =>
          String(modelo.IDMODELO) ===
          String(modeloSeleccionado)
      )?.NOMBRE || ""
    );
  }

  function consultarWhatsApp(producto = null) {
    if (!WHATSAPP_NUMBER) {
      window.alert(
        "El número de WhatsApp todavía no está configurado."
      );
      return;
    }

    const marcaElegida =
      obtenerNombreMarcaSeleccionada();
    const modeloElegido =
      obtenerNombreModeloSeleccionado();

    const mensaje = producto
      ? `Hola, quisiera consultar por ${producto.NOMBRE} (${producto.CODIGO}). Precio mostrado: S/ ${Number(
          producto.PRECIO_VENTA
        ).toFixed(2)}.`
      : marcaElegida || modeloElegido
        ? `Hola, estoy buscando productos compatibles con ${
            marcaElegida || "mi equipo"
          }${
            modeloElegido ? ` ${modeloElegido}` : ""
          }. Quisiera consultar la disponibilidad.`
        : "Hola, estoy buscando un celular, producto o accesorio para mi dispositivo. Quisiera consultar la disponibilidad.";

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      mensaje
    )}`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-black py-20 text-white">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-red-700/20 px-4 py-2 text-sm font-semibold text-red-400">
            <ShoppingBag size={17} />
            Catálogo Taurus
          </span>

          <h1 className="mt-6 text-4xl font-bold md:text-6xl">
            Celulares, productos y accesorios
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-lg text-gray-300">
            Encuentra equipos móviles, cargadores,
            pantallas, baterías, micas, repuestos y
            accesorios compatibles con tu modelo.
          </p>

          <div className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
            <DatoHero
              icono={Package}
              valor={resumen.total}
              texto="Disponibles"
            />

            <DatoHero
              icono={Smartphone}
              valor={resumen.celulares}
              texto="Celulares"
            />

            <DatoHero
              icono={ShoppingBag}
              valor={resumen.accesorios}
              texto="Accesorios"
            />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <SlidersHorizontal
                size={20}
                className="text-red-700"
              />

              <h2 className="font-bold text-gray-900">
                Encuentra productos para tu equipo
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <div className="relative xl:col-span-2">
                <Search
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  value={busqueda}
                  onChange={(evento) =>
                    setBusqueda(evento.target.value)
                  }
                  placeholder="Buscar producto, celular, marca o modelo"
                  className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 outline-none focus:border-red-600"
                />
              </div>

              <select
                value={categoriaSeleccionada}
                onChange={(evento) =>
                  setCategoriaSeleccionada(
                    evento.target.value
                  )
                }
                className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600"
              >
                <option value="">
                  Todas las categorías
                </option>

                {categorias.map((categoria) => (
                  <option
                    key={categoria.IDCATEGORIA}
                    value={categoria.IDCATEGORIA}
                  >
                    {categoria.NOMBRE}
                  </option>
                ))}
              </select>

              <select
                value={marcaSeleccionada}
                onChange={cambiarMarca}
                className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600"
              >
                <option value="">
                  Todas las marcas
                </option>

                {marcas.map((marca) => (
                  <option
                    key={marca.IDMARCA}
                    value={marca.IDMARCA}
                  >
                    {marca.NOMBRE}
                  </option>
                ))}
              </select>

              <select
                value={modeloSeleccionado}
                onChange={(evento) =>
                  setModeloSeleccionado(
                    evento.target.value
                  )
                }
                disabled={
                  !marcaSeleccionada ||
                  cargandoModelos
                }
                className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600 disabled:cursor-not-allowed disabled:bg-gray-100"
              >
                <option value="">
                  {cargandoModelos
                    ? "Cargando modelos..."
                    : marcaSeleccionada
                      ? "Todos los modelos"
                      : "Selecciona una marca"}
                </option>

                {modelos.map((modelo) => (
                  <option
                    key={modelo.IDMODELO}
                    value={modelo.IDMODELO}
                  >
                    {modelo.NOMBRE}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                <BotonTipo
                  activo={tipoCatalogo === "todos"}
                  onClick={() =>
                    setTipoCatalogo("todos")
                  }
                  icono={Package}
                >
                  Todo
                </BotonTipo>

                <BotonTipo
                  activo={
                    tipoCatalogo === "celulares"
                  }
                  onClick={() =>
                    setTipoCatalogo("celulares")
                  }
                  icono={Smartphone}
                >
                  Celulares
                </BotonTipo>

                <BotonTipo
                  activo={
                    tipoCatalogo === "accesorios"
                  }
                  onClick={() =>
                    setTipoCatalogo("accesorios")
                  }
                  icono={ShoppingBag}
                >
                  Accesorios
                </BotonTipo>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <ArrowUpDown
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <select
                    value={orden}
                    onChange={(evento) =>
                      setOrden(evento.target.value)
                    }
                    className="w-full appearance-none rounded-xl border border-gray-300 py-3 pl-11 pr-4 outline-none focus:border-red-600"
                  >
                    <option value="recientes">
                      Más recientes
                    </option>

                    <option value="precio-menor">
                      Menor precio
                    </option>

                    <option value="precio-mayor">
                      Mayor precio
                    </option>

                    <option value="nombre">
                      Nombre A-Z
                    </option>

                    <option value="stock">
                      Mayor stock
                    </option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={limpiarFiltros}
                  className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  <RotateCcw size={18} />
                  Limpiar
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              <AlertCircle size={22} />
              <p>{error}</p>
            </div>
          )}

          {cargando ? (
            <div className="flex justify-center py-24">
              <LoaderCircle
                size={44}
                className="animate-spin text-red-700"
              />
            </div>
          ) : (
            <>
              <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Package size={19} />
                  {productosFiltrados.length} productos
                  disponibles
                </div>

                {(marcaSeleccionada ||
                  modeloSeleccionado) && (
                  <p className="text-sm font-semibold text-red-700">
                    Compatibles con{" "}
                    {obtenerNombreMarcaSeleccionada()}
                    {modeloSeleccionado
                      ? ` ${obtenerNombreModeloSeleccionado()}`
                      : ""}
                  </p>
                )}
              </div>

              <div className="mt-6 grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {productosFiltrados.map((producto) => (
                  <TarjetaProducto
                    key={producto.IDPRODUCTO}
                    producto={producto}
                    verDetalle={() =>
                      setProductoDetalle(producto)
                    }
                    consultar={() =>
                      consultarWhatsApp(producto)
                    }
                  />
                ))}
              </div>

              {productosFiltrados.length === 0 && (
                <div className="mt-10 rounded-3xl bg-white py-20 text-center shadow-sm">
                  <Package
                    size={52}
                    className="mx-auto text-gray-300"
                  />

                  <h2 className="mt-5 text-xl font-bold text-gray-800">
                    No encontramos productos
                  </h2>

                  <p className="mx-auto mt-2 max-w-xl text-gray-500">
                    Prueba con otra marca, modelo o
                    categoría. También puedes
                    consultarnos directamente.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      consultarWhatsApp()
                    }
                    className="mx-auto mt-6 flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-bold text-white transition hover:bg-green-700"
                  >
                    <MessageCircle size={20} />
                    Consultar por WhatsApp
                  </button>
                </div>
              )}
            </>
          )}

          <section className="mt-16 overflow-hidden rounded-3xl bg-black px-7 py-10 text-white md:px-12">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-red-400">
                  Atención personalizada
                </p>

                <h2 className="mt-3 text-3xl font-bold">
                  ¿No encuentras tu celular o
                  accesorio?
                </h2>

                <p className="mt-3 max-w-2xl text-gray-300">
                  Indícanos la marca y el modelo de tu
                  dispositivo. Revisaremos equipos,
                  repuestos y accesorios compatibles.
                </p>
              </div>

              <button
                type="button"
                onClick={() => consultarWhatsApp()}
                className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-4 font-bold text-white transition hover:bg-green-700"
              >
                <MessageCircle size={21} />
                Consultar por WhatsApp
              </button>
            </div>
          </section>

          <section className="mt-10 grid gap-5 md:grid-cols-3">
            <Beneficio
              icono={BadgeCheck}
              titulo="Productos verificados"
              descripcion="Revisamos el estado y las características de los equipos y accesorios."
            />

            <Beneficio
              icono={RefreshCcw}
              titulo="Stock actualizado"
              descripcion="El catálogo muestra únicamente productos que tienen disponibilidad."
            />

            <Beneficio
              icono={Headphones}
              titulo="Asesoría personalizada"
              descripcion="Te ayudamos a comprobar la compatibilidad antes de realizar tu compra."
            />
          </section>
        </div>
      </section>

      {productoDetalle && (
        <ModalProducto
          producto={productoDetalle}
          cerrar={() => setProductoDetalle(null)}
          consultar={() =>
            consultarWhatsApp(productoDetalle)
          }
        />
      )}
    </main>
  );
}

function DatoHero({
  icono: Icono,
  valor,
  texto,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <Icono
        size={22}
        className="mx-auto text-red-400"
      />

      <p className="mt-2 text-2xl font-bold">
        {valor}
      </p>

      <p className="mt-1 text-sm text-gray-400">
        {texto}
      </p>
    </div>
  );
}

function BotonTipo({
  activo,
  onClick,
  icono: Icono,
  children,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
        activo
          ? "bg-red-700 text-white"
          : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
      }`}
    >
      <Icono size={17} />
      {children}
    </button>
  );
}

function TarjetaProducto({
  producto,
  verDetalle,
  consultar,
}) {
  const compatibilidad =
    producto.MODELOS_COMPATIBLES ||
    [producto.MARCA, producto.MODELO]
      .filter(Boolean)
      .join(" ") ||
    "Universal";

  const esCelular = esCategoriaCelular(
    producto.CATEGORIA
  );

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative flex h-56 items-center justify-center overflow-hidden bg-gray-100">
        {producto.IMAGEN ? (
          <img
            src={producto.IMAGEN}
            alt={producto.NOMBRE}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            onError={(evento) => {
              evento.currentTarget.style.display =
                "none";

              if (
                evento.currentTarget
                  .nextElementSibling
              ) {
                evento.currentTarget.nextElementSibling.style.display =
                  "flex";
              }
            }}
          />
        ) : null}

        <div
          className={`h-full w-full items-center justify-center ${
            producto.IMAGEN ? "hidden" : "flex"
          }`}
        >
          {esCelular ? (
            <Smartphone
              size={52}
              className="text-gray-300"
            />
          ) : (
            <ImageOff
              size={48}
              className="text-gray-300"
            />
          )}
        </div>

        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/80 px-3 py-1 text-xs font-semibold text-white">
          {esCelular && <Smartphone size={14} />}
          {producto.CATEGORIA}
        </span>

        {esCelular && (
          <span className="absolute right-4 top-4 rounded-full bg-red-700 px-3 py-1 text-xs font-bold text-white">
            Equipo en venta
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-red-700">
          {producto.CODIGO}
        </p>

        <h2 className="mt-2 text-xl font-bold text-gray-900">
          {producto.NOMBRE}
        </h2>

        <p className="mt-2 line-clamp-2 min-h-[48px] text-sm leading-6 text-gray-600">
          {producto.DESCRIPCION ||
            "Producto disponible en Taurus."}
        </p>

        <div className="mt-4">
          <p className="text-sm text-gray-500">
            {esCelular
              ? "Marca y modelo"
              : "Compatibilidad"}
          </p>

          <p
            className="line-clamp-2 font-semibold text-gray-800"
            title={compatibilidad}
          >
            {compatibilidad}
          </p>
        </div>

        <div className="mt-6 flex items-end justify-between">
          <div>
            <p className="text-sm text-gray-500">
              Precio
            </p>

            <p className="text-2xl font-bold text-red-700">
              S/{" "}
              {Number(
                producto.PRECIO_VENTA
              ).toFixed(2)}
            </p>
          </div>

          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
            Stock: {producto.STOCK}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={verDetalle}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-3 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-100"
          >
            <Eye size={18} />
            Ver detalles
          </button>

          <button
            type="button"
            onClick={consultar}
            className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-3 py-3 text-sm font-bold text-white transition hover:bg-green-700"
          >
            <MessageCircle size={18} />
            Consultar
          </button>
        </div>
      </div>
    </article>
  );
}

function ModalProducto({
  producto,
  cerrar,
  consultar,
}) {
  const compatibilidad =
    producto.MODELOS_COMPATIBLES ||
    [producto.MARCA, producto.MODELO]
      .filter(Boolean)
      .join(" ") ||
    "Universal";

  const esCelular = esCategoriaCelular(
    producto.CATEGORIA
  );

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4"
      onMouseDown={cerrar}
    >
      <article
        className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
        onMouseDown={(evento) =>
          evento.stopPropagation()
        }
      >
        <header className="flex items-center justify-between border-b px-6 py-5">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-red-700">
              {producto.CODIGO}
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              {producto.NOMBRE}
            </h2>
          </div>

          <button
            type="button"
            onClick={cerrar}
            className="rounded-xl p-2 text-gray-500 transition hover:bg-gray-100"
          >
            <X size={25} />
          </button>
        </header>

        <div className="grid gap-8 p-6 md:grid-cols-2">
          <div className="flex min-h-[320px] items-center justify-center overflow-hidden rounded-2xl bg-gray-100">
            {producto.IMAGEN ? (
              <img
                src={producto.IMAGEN}
                alt={producto.NOMBRE}
                className="h-full max-h-[430px] w-full object-contain"
              />
            ) : esCelular ? (
              <Smartphone
                size={80}
                className="text-gray-300"
              />
            ) : (
              <ImageOff
                size={70}
                className="text-gray-300"
              />
            )}
          </div>

          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-3 py-1 text-sm font-semibold text-white">
              {esCelular && <Smartphone size={15} />}
              {producto.CATEGORIA}
            </span>

            <p className="mt-5 leading-7 text-gray-600">
              {producto.DESCRIPCION ||
                "Producto disponible en Taurus."}
            </p>

            <div className="mt-7 space-y-4 rounded-2xl bg-gray-50 p-5">
              <DatoProducto
                titulo="Marca"
                valor={
                  producto.MARCA ||
                  "No especificada"
                }
              />

              <DatoProducto
                titulo="Modelo principal"
                valor={
                  producto.MODELO ||
                  "No especificado"
                }
              />

              <DatoProducto
                titulo={
                  esCelular
                    ? "Equipo"
                    : "Modelos compatibles"
                }
                valor={compatibilidad}
              />

              <DatoProducto
                titulo="Disponibilidad"
                valor={`${producto.STOCK} unidades`}
              />
            </div>

            <div className="mt-7">
              <p className="text-sm text-gray-500">
                Precio
              </p>

              <p className="text-4xl font-bold text-red-700">
                S/{" "}
                {Number(
                  producto.PRECIO_VENTA
                ).toFixed(2)}
              </p>
            </div>

            <button
              type="button"
              onClick={consultar}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-4 font-bold text-white transition hover:bg-green-700"
            >
              <MessageCircle size={21} />
              Consultar por WhatsApp
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}

function DatoProducto({ titulo, valor }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-200 pb-3 last:border-0 last:pb-0">
      <span className="shrink-0 text-sm text-gray-500">
        {titulo}
      </span>

      <span className="text-right font-semibold text-gray-900">
        {valor}
      </span>
    </div>
  );
}

function Beneficio({
  icono: Icono,
  titulo,
  descripcion,
}) {
  return (
    <article className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="inline-flex rounded-xl bg-red-100 p-3 text-red-700">
        <Icono size={24} />
      </div>

      <h3 className="mt-4 text-lg font-bold text-gray-900">
        {titulo}
      </h3>

      <p className="mt-2 leading-6 text-gray-600">
        {descripcion}
      </p>
    </article>
  );
}

export default Products;
