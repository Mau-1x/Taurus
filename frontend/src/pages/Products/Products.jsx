import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Package,
  ShoppingBag,
  LoaderCircle,
  AlertCircle,
  ImageOff,
} from "lucide-react";

import {
  obtenerProductos,
  obtenerCategorias,
} from "../../services/productoService";

function Products() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState("");

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarProductos();
  }, []);

  async function cargarProductos() {
    try {
      setCargando(true);
      setError("");

      const [datosProductos, datosCategorias] =
        await Promise.all([
          obtenerProductos(),
          obtenerCategorias(),
        ]);

      setProductos(
        datosProductos.filter(
          (producto) => Number(producto.STOCK) > 0
        )
      );

      setCategorias(datosCategorias);
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
        producto.NOMBRE?.toLowerCase().includes(texto) ||
        producto.CODIGO?.toLowerCase().includes(texto) ||
        producto.CATEGORIA?.toLowerCase().includes(texto) ||
        producto.MARCA?.toLowerCase().includes(texto) ||
        producto.MODELO?.toLowerCase().includes(texto);

      const coincideCategoria =
        !categoriaSeleccionada ||
        String(producto.IDCATEGORIA) ===
          String(categoriaSeleccionada);

      return coincideTexto && coincideCategoria;
    });
  }, [productos, busqueda, categoriaSeleccionada]);

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-black py-20 text-white">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-red-700/20 px-4 py-2 text-sm font-semibold text-red-400">
            <ShoppingBag size={17} />
            Catálogo Taurus
          </span>

          <h1 className="mt-6 text-4xl font-bold md:text-6xl">
            Productos y accesorios
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-300">
            Encuentra cargadores, pantallas, baterías, micas,
            repuestos y accesorios disponibles.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="relative flex-1">
                <Search
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  value={busqueda}
                  onChange={(evento) =>
                    setBusqueda(evento.target.value)
                  }
                  placeholder="Buscar producto, marca o modelo"
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
              <div className="mt-8 flex items-center gap-2 text-sm text-gray-500">
                <Package size={19} />
                {productosFiltrados.length} productos disponibles
              </div>

              <div className="mt-6 grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {productosFiltrados.map((producto) => (
                  <TarjetaProducto
                    key={producto.IDPRODUCTO}
                    producto={producto}
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

                  <p className="mt-2 text-gray-500">
                    Prueba con otra búsqueda o categoría.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function TarjetaProducto({ producto }) {
  const compatibilidad = [
    producto.MARCA,
    producto.MODELO,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className="group overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative flex h-56 items-center justify-center overflow-hidden bg-gray-100">
        {producto.IMAGEN ? (
          <img
            src={producto.IMAGEN}
            alt={producto.NOMBRE}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            onError={(evento) => {
              evento.currentTarget.style.display = "none";
              evento.currentTarget.nextElementSibling.style.display =
                "flex";
            }}
          />
        ) : null}

        <div
          className={`h-full w-full items-center justify-center ${
            producto.IMAGEN ? "hidden" : "flex"
          }`}
        >
          <ImageOff size={48} className="text-gray-300" />
        </div>

        <span className="absolute left-4 top-4 rounded-full bg-black/80 px-3 py-1 text-xs font-semibold text-white">
          {producto.CATEGORIA}
        </span>
      </div>

      <div className="p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-red-700">
          {producto.CODIGO}
        </p>

        <h2 className="mt-2 text-xl font-bold text-gray-900">
          {producto.NOMBRE}
        </h2>

        <p className="mt-2 line-clamp-2 min-h-[48px] text-sm leading-6 text-gray-600">
          {producto.DESCRIPCION || "Producto disponible en Taurus."}
        </p>

        <div className="mt-4">
          <p className="text-sm text-gray-500">
            Compatibilidad
          </p>

          <p className="font-semibold text-gray-800">
            {compatibilidad || "Universal"}
          </p>
        </div>

        <div className="mt-6 flex items-end justify-between">
          <div>
            <p className="text-sm text-gray-500">
              Precio
            </p>

            <p className="text-2xl font-bold text-red-700">
              S/ {Number(producto.PRECIO_VENTA).toFixed(2)}
            </p>
          </div>

          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
            Stock: {producto.STOCK}
          </span>
        </div>
      </div>
    </article>
  );
}

export default Products;