const brands = [
  "Apple",
  "Samsung",
  "Xiaomi",
  "Motorola",
  "Huawei",
  "Honor",
  "Oppo",
  "Vivo",
  "Realme",
  "Tecno",
];

function Brands() {
  return (
    <section className="bg-gray-100 py-24">
      <div className="mx-auto max-w-7xl px-6">

        <div className="text-center">

          <span className="rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700">
            Marcas que atendemos
          </span>

          <h2 className="mt-5 text-4xl font-bold text-gray-900">
            Especialistas en las principales marcas
          </h2>

          <p className="mt-4 text-gray-600">
            Trabajamos con smartphones y tablets de las marcas más reconocidas.
          </p>

        </div>

        <div className="mt-16 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">

          {brands.map((brand) => (
            <div
              key={brand}
              className="flex h-28 items-center justify-center rounded-2xl bg-white shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <h3 className="text-xl font-bold text-gray-800">
                {brand}
              </h3>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}

export default Brands;