import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  User,
  Phone,
  Mail,
  Wrench,
  MessageSquare,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { crearReserva } from "../../services/reservaService";

const formularioInicial = {
  nombreCliente: "",
  celular: "",
  correo: "",
  servicio: "",
  descripcion: "",
  fechaReserva: "",
  horaReserva: "",
  observaciones: "",
};

function Reservations() {
  const [formulario, setFormulario] =
    useState(formularioInicial);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const servicio = searchParams.get("servicio");

    if (servicio) {
      setFormulario((anterior) => ({
        ...anterior,
        servicio,
      }));
    }
  }, [searchParams]);

  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  function manejarCambio(evento) {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();

    try {
      setEnviando(true);
      setMensaje("");
      setError("");

      if (formulario.celular.length < 9) {
        throw new Error(
          "Ingresa un número de celular válido"
        );
      }

      if (
        formulario.horaReserva < "10:00" ||
        formulario.horaReserva > "21:00"
      ) {
        throw new Error(
          "El horario de atención es de 10:00 a. m. a 9:00 p. m."
        );
      }

      await crearReserva({
        ...formulario,
        correo: formulario.correo || null,
        descripcion: formulario.descripcion || null,
        observaciones:
          formulario.observaciones || null,
      });

      setMensaje(
        "Tu reserva fue registrada correctamente. Nos comunicaremos contigo para confirmarla."
      );

      setFormulario(formularioInicial);
    } catch (errorReserva) {
      setError(errorReserva.message);
    } finally {
      setEnviando(false);
    }
  }

  const fechaMinima = new Date()
    .toISOString()
    .split("T")[0];

  return (
    <main className="min-h-screen bg-gray-100 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <span className="rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700">
            Atención técnica
          </span>

          <h1 className="mt-6 text-4xl font-bold text-gray-900 md:text-5xl">
            Reserva una cita
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Registra tus datos y selecciona el día y la hora
            en que deseas llevar tu equipo.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_380px]">
          <form
            onSubmit={manejarEnvio}
            className="grid gap-5 rounded-3xl bg-white p-7 shadow-lg md:grid-cols-2"
          >
            <Campo
              icono={User}
              label="Nombre completo"
              name="nombreCliente"
              value={formulario.nombreCliente}
              onChange={manejarCambio}
              required
            />

            <Campo
              icono={Phone}
              label="Celular"
              name="celular"
              value={formulario.celular}
              onChange={manejarCambio}
              maxLength={9}
              required
            />

            <Campo
              icono={Mail}
              label="Correo"
              name="correo"
              type="email"
              value={formulario.correo}
              onChange={manejarCambio}
            />

            <SelectServicio
              value={formulario.servicio}
              onChange={manejarCambio}
            />

            <Campo
              icono={CalendarDays}
              label="Fecha"
              name="fechaReserva"
              type="date"
              min={fechaMinima}
              value={formulario.fechaReserva}
              onChange={manejarCambio}
              required
            />

            <Campo
              icono={Clock}
              label="Hora"
              name="horaReserva"
              type="time"
              min="10:00"
              max="21:00"
              value={formulario.horaReserva}
              onChange={manejarCambio}
              required
            />

            <div className="md:col-span-2">
              <Area
                icono={MessageSquare}
                label="Describe el problema"
                name="descripcion"
                value={formulario.descripcion}
                onChange={manejarCambio}
                placeholder="Ejemplo: la pantalla está rota y no responde al tacto"
              />
            </div>

            <div className="md:col-span-2">
              <Area
                icono={MessageSquare}
                label="Observaciones adicionales"
                name="observaciones"
                value={formulario.observaciones}
                onChange={manejarCambio}
                placeholder="Indica algún detalle adicional"
              />
            </div>

            {error && (
              <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 md:col-span-2">
                <AlertCircle size={22} />
                <p>{error}</p>
              </div>
            )}

            {mensaje && (
              <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700 md:col-span-2">
                <CheckCircle2 size={22} />
                <p>{mensaje}</p>
              </div>
            )}

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={enviando}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-700 px-6 py-4 font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {enviando && (
                  <LoaderCircle
                    size={20}
                    className="animate-spin"
                  />
                )}

                {enviando
                  ? "Registrando reserva..."
                  : "Reservar cita"}
              </button>
            </div>
          </form>

          <aside className="h-fit rounded-3xl bg-black p-7 text-white shadow-lg">
            <Wrench className="text-red-500" size={38} />

            <h2 className="mt-5 text-2xl font-bold">
              Servicio técnico Taurus
            </h2>

            <p className="mt-3 text-gray-300">
              Atendemos problemas de hardware y software
              para celulares y tablets.
            </p>

            <div className="mt-7 space-y-5">
              <Informacion
                titulo="Horario"
                texto="Lunes a sábado, de 10:00 a. m. a 9:00 p. m."
              />

              <Informacion
                titulo="Confirmación"
                texto="La reserva quedará pendiente hasta que nuestro personal la confirme."
              />

              <Informacion
                titulo="Recomendación"
                texto="Trae el cargador y los accesorios relacionados con la falla, cuando sea necesario."
              />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Campo({
  icono: Icono,
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  maxLength,
  min,
  max,
}) {
  return (
    <label>
      <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
        <Icono size={17} className="text-red-700" />
        {label}
        {required && <span className="text-red-600">*</span>}
      </span>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        maxLength={maxLength}
        min={min}
        max={max}
        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-red-600"
      />
    </label>
  );
}

function Area({
  icono: Icono,
  label,
  name,
  value,
  onChange,
  placeholder,
}) {
  return (
    <label>
      <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
        <Icono size={17} className="text-red-700" />
        {label}
      </span>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows="4"
        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-red-600"
      />
    </label>
  );
}

function SelectServicio({ value, onChange }) {
  return (
    <label>
      <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
        <Wrench size={17} className="text-red-700" />
        Servicio
        <span className="text-red-600">*</span>
      </span>

      <select
        name="servicio"
        value={value}
        onChange={onChange}
        required
        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-red-600"
      >
        <option value="">Seleccionar servicio</option>
        <option value="Diagnóstico general">
          Diagnóstico general
        </option>
        <option value="Cambio de pantalla">
          Cambio de pantalla
        </option>
        <option value="Cambio de batería">
          Cambio de batería
        </option>
        <option value="Reparación de puerto de carga">
          Reparación de puerto de carga
        </option>
        <option value="Problema de software">
          Problema de software
        </option>
        <option value="Liberación de equipo">
          Liberación de equipo
        </option>
        <option value="Otro servicio">
          Otro servicio
        </option>
      </select>
    </label>
  );
}

function Informacion({ titulo, texto }) {
  return (
    <div className="border-b border-white/10 pb-5">
      <p className="font-semibold text-red-400">
        {titulo}
      </p>

      <p className="mt-1 text-sm leading-6 text-gray-300">
        {texto}
      </p>
    </div>
  );
}

export default Reservations;