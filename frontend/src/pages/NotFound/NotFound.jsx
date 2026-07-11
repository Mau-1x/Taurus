import { Link } from "react-router-dom";
import {
  Home,
  ArrowLeft,
  SearchX,
} from "lucide-react";

function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-6 py-16">
      <section className="w-full max-w-2xl rounded-3xl bg-white p-10 text-center shadow-xl md:p-14">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-100 text-red-700">
          <SearchX size={48} />
        </div>

        <p className="mt-8 text-7xl font-black text-red-700">
          404
        </p>

        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          Página no encontrada
        </h1>

        <p className="mx-auto mt-4 max-w-lg leading-7 text-gray-600">
          La dirección que ingresaste no existe, fue modificada o ya no está
          disponible.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-700 px-6 py-4 font-semibold text-white transition hover:bg-red-800"
          >
            <Home size={20} />
            Volver al inicio
          </Link>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-6 py-4 font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
            Regresar
          </button>
        </div>
      </section>
    </main>
  );
}

export default NotFound;