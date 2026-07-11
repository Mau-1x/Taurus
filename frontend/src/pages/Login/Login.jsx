import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LockKeyhole,
  Mail,
  LogIn,
  LoaderCircle,
  AlertCircle,
  Wrench,
} from "lucide-react";

import { iniciarSesion } from "../../services/authService";

function Login() {
  const navigate = useNavigate();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function manejarEnvio(evento) {
    evento.preventDefault();

    try {
      setCargando(true);
      setError("");

      await iniciarSesion(correo, password);

      navigate("/admin/dashboard", {
        replace: true,
      });
    } catch (errorLogin) {
      setError(errorLogin.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-gray-950 to-red-950 px-5 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2">
        <section className="hidden bg-black p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="inline-flex rounded-2xl bg-red-700 p-4">
              <Wrench size={34} />
            </div>

            <h1 className="mt-7 text-4xl font-bold">
              Taurus
            </h1>

            <p className="mt-3 text-lg text-gray-300">
              Panel administrativo del servicio técnico.
            </p>
          </div>

          <div className="space-y-4 text-sm text-gray-400">
            <p>Gestiona clientes y equipos.</p>
            <p>Controla reparaciones e inventario.</p>
            <p>Administra ventas y reservas.</p>
          </div>
        </section>

        <section className="p-8 md:p-12">
          <div>
            <p className="text-sm font-semibold text-red-700">
              Acceso administrativo
            </p>

            <h2 className="mt-2 text-3xl font-bold text-gray-900">
              Iniciar sesión
            </h2>

            <p className="mt-3 text-gray-500">
              Ingresa tus credenciales para continuar.
            </p>
          </div>

          <form
            onSubmit={manejarEnvio}
            className="mt-9 space-y-5"
          >
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-gray-700">
                Correo electrónico
              </span>

              <div className="relative">
                <Mail
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="email"
                  value={correo}
                  onChange={(evento) =>
                    setCorreo(evento.target.value)
                  }
                  required
                  placeholder="admin@taurus.com"
                  className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 outline-none transition focus:border-red-600"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-gray-700">
                Contraseña
              </span>

              <div className="relative">
                <LockKeyhole
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="password"
                  value={password}
                  onChange={(evento) =>
                    setPassword(evento.target.value)
                  }
                  required
                  placeholder="Ingresa tu contraseña"
                  className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 outline-none transition focus:border-red-600"
                />
              </div>
            </label>

            {error && (
              <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                <AlertCircle size={21} />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-700 px-6 py-4 font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cargando ? (
                <LoaderCircle
                  size={20}
                  className="animate-spin"
                />
              ) : (
                <LogIn size={20} />
              )}

              {cargando
                ? "Ingresando..."
                : "Ingresar al panel"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

export default Login;