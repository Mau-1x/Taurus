import {
  ShieldCheck,
  Clock3,
  Award,
  Users,
} from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Garantía en cada reparación",
    description:
      "Todos nuestros servicios cuentan con garantía para brindarte tranquilidad.",
  },
  {
    icon: Clock3,
    title: "Diagnóstico rápido",
    description:
      "Evaluamos tu equipo en el menor tiempo posible para ofrecerte una solución.",
  },
  {
    icon: Award,
    title: "Repuestos de calidad",
    description:
      "Trabajamos con repuestos originales y de alta calidad según la necesidad del cliente.",
  },
  {
    icon: Users,
    title: "Atención personalizada",
    description:
      "Te mantenemos informado durante todo el proceso de reparación.",
  },
];

function WhyChooseUs() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">

        <div className="text-center">
          <span className="rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700">
            ¿Por qué elegir Taurus?
          </span>

          <h2 className="mt-5 text-4xl font-bold text-gray-900">
            Tu equipo merece un servicio profesional
          </h2>

          <p className="mt-4 text-gray-600 max-w-3xl mx-auto">
            Nos enfocamos en ofrecer reparaciones rápidas, seguras y con garantía,
            utilizando herramientas especializadas y atención personalizada.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {features.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className="flex gap-5 rounded-2xl border border-gray-200 p-8 transition hover:shadow-lg"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-red-100">
                  <Icon className="text-red-600" size={34} />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-gray-600">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export default WhyChooseUs;