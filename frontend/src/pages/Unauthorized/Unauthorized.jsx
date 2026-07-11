import { ShieldX, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Unauthorized() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-5">
      <section className="w-full max-w-lg rounded-3xl bg-white p-10 text-center shadow-xl">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-700">
          <ShieldX size={42} />
        </div>

        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          Acceso denegado
        </h1>

        <p className="mt-3 text-gray-600">
          Tu usuario no tiene permisos para ingresar a esta sección.
        </p>

        <button
          onClick={() => navigate("/admin/dashboard")}
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-red-700 px-6 py-3 font-semibold text-white hover:bg-red-800"
        >
          <ArrowLeft size={19} />
          Volver al panel
        </button>
      </section>
    </main>
  );
}

export default Unauthorized;