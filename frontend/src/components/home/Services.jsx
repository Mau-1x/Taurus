import {
  Smartphone,
  BatteryCharging,
  Usb,
  ShieldCheck,
  Wrench,
  Headphones,
} from "lucide-react";

const services = [
  {
    icon: Smartphone,
    title: "Cambio de Pantalla",
    description: "Pantallas originales y compatibles con garantía.",
  },
  {
    icon: BatteryCharging,
    title: "Cambio de Batería",
    description: "Mayor duración y rendimiento para tu equipo.",
  },
  {
    icon: Usb,
    title: "Puerto de Carga",
    description: "Reparamos conectores USB y problemas de carga.",
  },
  {
    icon: Wrench,
    title: "Software",
    description: "Actualización, desbloqueo, formateo y optimización.",
  },
  {
    icon: Headphones,
    title: "Auriculares",
    description: "Solución a fallas de audio y conectividad.",
  },
  {
    icon: ShieldCheck,
    title: "Liberación",
    description: "Liberación de equipos y soporte especializado.",
  },
];

function Services() {
  return (
    <section className="bg-gray-50 py-24">
      <div className="mx-auto max-w-7xl px-6">

        <div className="text-center">
          <span className="rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700">
            Nuestros Servicios
          </span>

          <h2 className="mt-5 text-4xl font-bold text-gray-900">
            Todo lo que tu dispositivo necesita
          </h2>

          <p className="mt-4 text-gray-600">
            Brindamos soluciones profesionales para celulares y tablets
            utilizando repuestos de calidad y herramientas especializadas.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            const Icon = service.icon;

            return (
              <div
                key={index}
                className="rounded-2xl bg-white p-8 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100">
                  <Icon size={34} className="text-red-600" />
                </div>

                <h3 className="text-xl font-bold text-gray-900">
                  {service.title}
                </h3>

                <p className="mt-3 text-gray-600">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export default Services;