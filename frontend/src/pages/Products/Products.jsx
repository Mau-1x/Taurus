function Products() {
  return (
    <section className="min-h-screen bg-gray-50 py-16">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900">
            Tienda Taurus
          </h1>

          <p className="mt-3 text-gray-600">
            Encuentra cargadores, micas, pantallas, baterías y accesorios para tu dispositivo.
          </p>
        </div>

        {/* Barra superior */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:justify-between">

          <input
            type="text"
            placeholder="Buscar productos..."
            className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600"
          />

          <select className="rounded-xl border border-gray-300 px-4 py-3">
            <option>Todas las categorías</option>
            <option>Cargadores</option>
            <option>Micas</option>
            <option>Pantallas</option>
            <option>Baterías</option>
            <option>Accesorios</option>
          </select>

        </div>

        {/* Productos temporales */}

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">

          {[1,2,3,4,5,6,7,8].map((item)=>(
            <div
              key={item}
              className="rounded-2xl bg-white p-5 shadow transition hover:-translate-y-2 hover:shadow-xl"
            >

              <div className="flex h-48 items-center justify-center rounded-xl bg-gray-100">
                📱 Imagen
              </div>

              <h2 className="mt-5 text-xl font-bold">
                Producto {item}
              </h2>

              <p className="mt-2 text-gray-500">
                Descripción corta del producto.
              </p>

              <h3 className="mt-4 text-2xl font-bold text-red-600">
                S/. 49.90
              </h3>

              <button className="mt-5 w-full rounded-xl bg-red-700 py-3 font-semibold text-white transition hover:bg-red-800">
                Agregar al carrito
              </button>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}

export default Products;